/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

import {createRequire} from 'node:module'
const require = createRequire(import.meta.url);

const AWS = require('aws-sdk')
const words = require('an-array-of-english-words')

AWS.config.update({
  region: "us-west-2",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

const dialPad = {
  2: "abc",
  3: "def",
  4: "ghi",
  5: "jkl",
  6: "mno",
  7: "pqrs",
  8: "tuv",
  9: "wxyz",
};

async function insertVanityNumbersIntoTable(phoneNumber, vanityNumbers) {
  const table = "vanity_numbers";
  const params = {
    TableName: table,
    Item: {
      phone_number: phoneNumber,
      vanityNumbers: vanityNumbers,
    },
  };

  console.log("Adding a new phone to DB");
  dbClient.put(params).promise();
}

function threeVanityPossibilities(vanityOptions) {
  let topThreeVanities = "";
  let numOptions;
  vanityOptions.length < 3
    ? (numOptions = vanityOptions.length)
    : (numOptions = 3);
  for (let i = 0; i < numOptions; i++) {
    topThreeVanities += vanityOptions[i];
    if (i !== numOptions - 1) {
      topThreeVanities += ", ";
    }
  }
  return topThreeVanities;
}

function converPhoneToVanity(phoneNumber) {
  function isValidWord(word) {
    if (words.includes(word)) {
      return true;
    }
    return false;
  }

  function checkCountryAreaCode(phoneNumber) {
    const code = `${phoneNumber[1]}-${phoneNumber.slice(2, 5)}`;
    return code;
  }

  function filterPhoneNumber(phoneNumber) {
    let filteredNumber = phoneNumber
      .slice(5)
      .replace(/[' ']/g, "")
      .replace(/[-]/g, "");

    if (filteredNumber.includes("0") || filteredNumber.includes("1")) {
      console.error("invalid number, cannot include 0 or 1");
      return false;
    }

    return filteredNumber;
  }

  const number = filterPhoneNumber(phoneNumber);
  const countryAreaCode = checkCountryAreaCode(phoneNumber);
  const vanityOptions = [];
  const firstLetterOptions = dialPad[number[0]];
  const secondLetterOptions = dialPad[number[1]];
  const thirdLetterOptions = dialPad[number[2]];
  const fourthLetterOptions = dialPad[number[3]];
  const fifthLetterOptions = dialPad[number[4]];
  const sixthLetterOptions = dialPad[number[5]];
  const seventhLetterOptions = dialPad[number[6]];
  const firstThreeToWords = [];
  const lastFourToWords = [];

  // Get three letter words from the first three digits and store them in an array
  for (
    let firstIndex = 0;
    firstIndex < firstLetterOptions.length;
    firstIndex++
  ) {
    for (
      let secondIndex = 0;
      secondIndex < secondLetterOptions.length;
      secondIndex++
    ) {
      for (
        let thirdIndex = 0;
        thirdIndex < thirdLetterOptions.length;
        thirdIndex++
      ) {
        const currWord =
          firstLetterOptions[firstIndex] +
          secondLetterOptions[secondIndex] +
          thirdLetterOptions[thirdIndex];
        if (isValidWord(currWord)) {
          firstThreeToWords.push(currWord);
        }
      }
    }
  }
  // Get four letter words from the last four digits and store them in an array
  for (
    let fourthIndex = 0;
    fourthIndex < fourthLetterOptions.length;
    fourthIndex++
  ) {
    for (
      let fifthIndex = 0;
      fifthIndex < fifthLetterOptions.length;
      fifthIndex++
    ) {
      for (
        let sixthIndex = 0;
        sixthIndex < sixthLetterOptions.length;
        sixthIndex++
      ) {
        for (
          let seventhIndex = 0;
          seventhIndex < seventhLetterOptions.length;
          seventhIndex++
        ) {
          const currWord =
            fourthLetterOptions[fourthIndex] +
            fifthLetterOptions[fifthIndex] +
            sixthLetterOptions[sixthIndex] +
            seventhLetterOptions[seventhIndex];
          if (isValidWord(currWord)) {
            lastFourToWords.push(currWord);
          }
        }
      }
    }
  }
  // If there are no three letter word options, create vanity options from just four letter word options
  if (firstThreeToWords.length === 0) {
    for (let i = 0; i < lastFourToWords.length; i++) {
      vanityOptions.push(
        `${countryAreaCode}-${number[0]}${number[1]}${number[2]}-${lastFourToWords[i]}`.toUpperCase()
      );
      if (vanityOptions.length >= 5) {
        return vanityOptions;
      }
    }
  } else {
    // Create combinations of three letter and four letter words and add them to vanity options
    for (let i = 0; i < firstThreeToWords.length; i++) {
      for (let j = 0; j < lastFourToWords.length; j++) {
        vanityOptions.push(
          `${countryAreaCode}-${firstThreeToWords[i]}-${lastFourToWords[j]}`.toUpperCase()
        );
        if (vanityOptions.length >= 5) {
          return vanityOptions;
        }
      }
    }
    // If there are not yet five vanity options, add vanity options made of the first three digits of the phone number
    for (let k = 0; k < lastFourToWords.length; k++) {
      vanityOptions.push(
        `${countryAreaCode}-${number[0]}${number[1]}${number[2]}-${lastFourToWords[k]}`.toUpperCase()
      );
      if (vanityOptions.length >= 5) {
        return vanityOptions;
      }
    }
  }
  return vanityOptions;
}

export const handler = async function (event, context, callback) {
  const phoneNumber =
    event["Details"]["ContactData"]["CustomerEndpoint"]["Address"];

  const vanityNumbers = converPhoneToVanity(phoneNumber);
  console.log(vanityNumbers)

  const topThreeVanities = threeVanityPossibilities(vanityNumbers);

  console.log(topThreeVanities)


  const response = {
    PhoneNumber: phoneNumber,
    VanityPossibilities: topThreeVanities,
  };
  await insertVanityNumbersIntoTable(phoneNumber, vanityNumbers)
    .then(() => {
      callback(null, response);
    })
    .catch((err) => {
      console.log(err);
    });
};
