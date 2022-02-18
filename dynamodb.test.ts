import { Agent } from "https";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  PutCommandInput,
  GetCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

const TABLE = process.env.DYNAMO_TABLE;
const AWS_REGION = process.env.AWS_REGION;

const DEFAULT_AWS_CONNECT_TIMEOUT = 3000;
const DEFAULT_AWS_MAX_RETRIES = 3;

if (TABLE === "PLACEHOLDER" || AWS_REGION === "PLACEHOLDER") {
  throw Error(
    "Replace DYNAMO_TABLE AND / OR AWS_REGION with the appropriate value(s) in .jest/setEnvVars.js "
  );
}

const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  rejectUnauthorized: true,
});

const buildRequestHandler = (): NodeHttpHandler =>
  new NodeHttpHandler({
    httpsAgent,
    connectionTimeout: DEFAULT_AWS_CONNECT_TIMEOUT,
  });

const dynamoDocumentClient: DynamoDBDocumentClient =
  DynamoDBDocumentClient.from(
    new DynamoDBClient({
      maxAttempts: DEFAULT_AWS_MAX_RETRIES,
      requestHandler: buildRequestHandler(),
      region: AWS_REGION,
    }),
    {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    }
  );

describe("AWS SDK 3 support for Epsagon", () => {
  it("should allow inserting an item to Dynamo and retrieve it", async () => {
    const itemToInsert: PutCommandInput["Item"] = {
      PK: "TEST_PK",
      SK: "TEST_SK",
      version: 1,
      data: {
        value: "Lorem Ipsum",
      },
    };

    const putParams: PutCommandInput = {
      TableName: TABLE,
      Item: itemToInsert,
      ConditionExpression: "attribute_not_exists(version) OR version = :prev",
      ExpressionAttributeValues: { ":prev": itemToInsert.version - 1 },
      ReturnValues: "NONE",
    };

    await dynamoDocumentClient.send(new PutCommand(putParams));

    const getParams: GetCommandInput = {
      TableName: TABLE,
      Key: {
        PK: "TEST_PK",
        SK: "TEST_SK",
      },
    };

    const { Item } = await dynamoDocumentClient.send(new GetCommand(getParams));

    expect(Item).toEqual(itemToInsert);
  });
});
