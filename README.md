## Project Setup

Follow these steps to create and set up your project:

1. Initialize a new Node.js project:
    ```bash
    npm init -y
    ```

2. Install TypeScript as a development dependency:
    ```bash
    npm install -D typescript
    ```

3. Create a TypeScript configuration file:
    ```bash
    npx tsc --init
    ```

4. Install Express using pnpm:
    ```bash
    pnpm i express
    ```

5. Install Express type definitions for better editor support:
    ```bash
    pnpm i @types/express
    ```

6. Update the `tsconfig.json` file to set custom `outDir` and `rootDir`:
        - Open `tsconfig.json` and modify/add the following options:
          ```json
          {
            "compilerOptions": {
              "outDir": "./dist",
              "rootDir": "./src"
            }
          }
          ```

7. Create the corresponding folders for your source and output files:
        ```bash
        mkdir src dist
        ```