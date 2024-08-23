# Things to know about 

## Layout

### App Components
All of the app components (and tests for them) are expected to be under the `lib` folder.

This is important because tests are explicitly invoked from under the folder

### App Tests
Test modules are maintained under the `test` folder.

End to end tests require to be executed in certain order (see the `test/jest.run-all-tests.js` file)