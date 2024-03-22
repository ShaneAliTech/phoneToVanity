'use strict';
import {createRequire} from 'node:module'
const require = createRequire(import.meta.url);

import {handler} from "../../app.mjs"
const expect = require('chai').expect;
const sinon = require('sinon');
const { DynamoDB } = require('aws-sdk');
let event, context;

const sandbox = sinon.createSandbox();

describe('Tests Phone to Vanity', function () {
    const log = sinon.spy(console, 'log');

    it('verifies successful response if phone number already exists in database', async () => {
        let data = { Item: { vanityNumbers: '+1206bugjeep, +1206bugjeer, +1206bugjees, +1206bugkeds, +1206bugkeep' } };
        sandbox.stub(DynamoDB.DocumentClient.prototype, 'put').returns({ promise: () => data });
        const callback = sinon.spy();

        event = {
            Name: "ContactFlowExecution",
            Details: {
              Parameters: {
                key1: "value1",
                key2: "value2"
              },
              ContactData: {
                ContactId: "ASDAcxcasDFSSDFs",
                InitialContactId: "Acxsada-asdasdaxA",
                PreviousContactId: "Acxsada-asdasdaxA",
                Channel: "Voice",
                InstanceARN: "",
                InitiationMethod: "INBOUND/OUTBOUND/TRANSFER/CALLBACK",
                SystemEndpoint: {
                  Type: "TELEPHONE_NUMBER",
                  Address: "01234567"
                },
                CustomerEndpoint: {
                  Type: "TELEPHONE_NUMBER",
                  Address: "+12072845367"
                },
                Queue: {
                  Name: "PrimaryPhoneQueue",
                  ARN: ""
                },
                Attributes: {
                  key1: "value",
                  key2: "value"
                }
              }
            }
          }

        const result = await handler(event, context, callback);

        expect(result).to.be.an('string');
        expect(result).to.equal('+1206bugjeep, +1206bugjeer, +1206bugjees, +1206bugkeds, +1206bugkeep');
        expect(callback.callCount).to.equal(1);
        expect(log.callCount).to.equal(1);
    });

    it('verifies successful response if phone number does not already exist in database', async () => {
        sandbox.restore();
        let data = { result: '+1206bugjeep, +1206bugjeer, +1206bugjees, +1206bugkeds, +1206bugkeep'};
        let empty = {};
        sandbox.stub(DynamoDB.DocumentClient.prototype, 'get').returns({ promise: () => empty });
        sandbox.stub(DynamoDB.DocumentClient.prototype, 'put').returns({ promise: () => data });
        const callback = sinon.spy();

        event = {
            Name: "ContactFlowExecution",
            Details: {
              Parameters: {
                key1: "value1",
                key2: "value2"
              },
              ContactData: {
                ContactId: "ASDAcxcasDFSSDFs",
                InitialContactId: "Acxsada-asdasdaxA",
                PreviousContactId: "Acxsada-asdasdaxA",
                Channel: "Voice",
                InstanceARN: "",
                InitiationMethod: "INBOUND/OUTBOUND/TRANSFER/CALLBACK",
                SystemEndpoint: {
                  Type: "TELEPHONE_NUMBER",
                  Address: "01234567"
                },
                CustomerEndpoint: {
                  Type: "TELEPHONE_NUMBER",
                  Address: "+12072845367"
                },
                Queue: {
                  Name: "PrimaryPhoneQueue",
                  ARN: ""
                },
                Attributes: {
                  key1: "value",
                  key2: "value"
                }
              }
            }
          }

        const result = await handler(event, context, callback);
        expect(result).to.be.an('string');
        expect(result).to.equal('+1206bugjeep, +1206bugjeer, +1206bugjees, +1206bugkeds, +1206bugkeep');
        expect(callback.callCount).to.equal(1);
        expect(log.callCount).to.equal(4);
    });

    it('test verifyNumber will return error message if phone number is blank or unsupported', async () => {
        sandbox.restore();
        const callback = sinon.spy();

        event = {
            Name: "ContactFlowExecution",
            Details: {
              Parameters: {
                key1: "value1",
                key2: "value2"
              },
              ContactData: {
                ContactId: "ASDAcxcasDFSSDFs",
                InitialContactId: "Acxsada-asdasdaxA",
                PreviousContactId: "Acxsada-asdasdaxA",
                Channel: "Voice",
                InstanceARN: "",
                InitiationMethod: "INBOUND/OUTBOUND/TRANSFER/CALLBACK",
                SystemEndpoint: {
                  Type: "TELEPHONE_NUMBER",
                  Address: "01234567"
                },
                CustomerEndpoint: {
                  Type: "TELEPHONE_NUMBER",
                  Address: "+12072845367"
                },
                Queue: {
                  Name: "PrimaryPhoneQueue",
                  ARN: ""
                },
                Attributes: {
                  key1: "value",
                  key2: "value"
                }
              }
            }
          }


        const result = await handler(event, context, callback);
        expect(result).to.be.an('string');
        expect(result).to.equal('unsupported phone number');
        expect(callback.callCount).to.equal(1);
    });
});