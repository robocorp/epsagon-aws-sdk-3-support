# Epsagon Support for AWS SDK 3.X

This repository contains a single test aimed at ensuring that Epsagon works nicely with AWS SDK 3.X.

## How to run the test

_Prerequisite: a provisioned DynamoDB Table with an access to this dynamoDB table_

1. Install the dependencies:

```
npm install
```

2. [Modify the environment variables](.jest/setEnvVars.js) to match the region and table for this DynamoDB instance
3. Run the (currently failing) test:

```
npm run test
```

**Note that two scripts have been defined:**

- `npm run test:working`
- `npm run test:not-working`

These showcase the test passing when a certain version of Epsagon, and not passing with the newer version
