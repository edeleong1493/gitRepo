export default {
  viewportHeight: 1080,
  viewportWidth: 1920,
  
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/1-getting-started/*','**/2-advanced-examples/*'],
    //By default, cypress is dynamically waiting for the element to be available and this default wait is 4 seconds. 
    //You can modify this settings globally for all commands by configuring. But It doesn't work
    //defaultCommandTimeout: 5000
  },
};


