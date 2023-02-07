/// <reference types ="cypress" />

import { method } from "cypress/types/bluebird"
import { contains } from "cypress/types/jquery"
import { isTypedArray } from "cypress/types/lodash"

describe('Test with backend', () => {
  
     beforeEach('login to the app', () =>{
           //The last parameters is where the response is called is this case the response is a mock. Note both option are correct
           //cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'tags.json'})
           cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'})
           cy.loginToApplication()

     })


     it('Verify correct request and response', () => {


      // To intercept API calls in the browser
      //The intercepction should be done before the test
      // as is an alias
         cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')


          cy.contains('New Article').click()
          cy.get('[formcontrolname="title"]').type('This is a n Title')  
          cy.get('[formcontrolname="description"]').type('This is a new description')
          cy.get('[formcontrolname="body"]').type('This is a body for the new article')
          cy.contains('Publish Article').click()

          cy.wait('@postArticles').then( xhr =>{
 
             console.log(xhr)
             expect(xhr.response.statusCode).to.equal(200)
             expect(xhr.request.body.article.body).to.equal('This is a body for the new article')
             expect(xhr.response.body.article.description).to.equal('This is a new description')

          })
          cy.contains('Delete Article').click()

     })

     it('verify popular tags are displayed',  () =>{

          cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')

     })

     it('verify globar feed likes count', () => {

       cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0} )
       cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'})

       cy.contains('Global Feed').click()
       cy.get('app-article-list button').then( hearList =>{
         expect(hearList[0]).to.contain('1')
         expect(hearList[1]).to.contain('5')
          
       })
       // You can add the .json extension or not cypress will find this file anyway
       cy.fixture('articles.json').then( file => {

          const articleLink = file.articles[1].slug 
          file.articles[1].favoritesCount = 6     
          
          cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleLink+'/favorite', file)

       })

       cy.get('app-article-list button').eq(1).click().should('contain', '6')


     })

     it('Intercepting and modifying the request and response', () => {


      // To intercept API calls in the browser
      // Here in this case we mock the request, we change the value at the request time
      //cy.intercept('POST', '**/articles/'). Both way are okay
        //  cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
        //   req.body.article.description = "This is a new description 2"
        //  }).as('postArticles')

      //Intercept the response from your server
        cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
          req.reply( res => {

              expect(res.body.article.description).to.equal('This is a new description')
              //After receiving the response you want to modify the response and send this modify response back to the server
              res.body.article.description = "This is a new description 2"

          })
         }).as('postArticles')


          cy.contains('New Article').click()
          cy.get('[formcontrolname="title"]').type('This is a Title 213')  
          cy.get('[formcontrolname="description"]').type('This is a new description')
          cy.get('[formcontrolname="body"]').type('This is a body for the new article')
          cy.contains('Publish Article').click()

          cy.wait('@postArticles').then( xhr =>{
 
             console.log(xhr)
             expect(xhr.response.statusCode).to.equal(200)
             expect(xhr.request.body.article.body).to.equal('This is a body for the new article')
             expect(xhr.response.body.article.description).to.equal('This is a new description 2')

          })
          cy.contains('Delete Article').click()

     })

     //API REQUEST IN CYPRESS

     it.only('delete a new article in a global feed', () => {

      // const userCredentials = 
      //   {
      //     "user": {
      //         "email": "artem.bondar16@gmail.com",
      //         "password": "CypressTest1"
      //     }
      // }

       const bodyRequest = {
        "article": {
            "tagList": [],
            "title": "REQUEST FROM API test 3",
            "description": "API TESTING IS EASY",
            "body": "ANGULAR IS COOL"
        }
      }

       //1
       //Simple request to generate the token
      //  cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials)
      //  .its('body')
        cy.get('@token').then( token  => {// Then After we did the request we get a response, we take token from the response body
       // const token = body.user.token
         
            //2 Another request, this request is different becasue I need to provide a object 
            // To create an article using the token previously
            cy.request({
                url: "https://api.realworld.io/api/articles/",
                headers: {
                  'Authorization': 'Token '+token},
                method: 'POST',
                body: bodyRequest  
            }).then( response => {
               //Here is the response from the request
               expect(response.status).to.equal(200)

            })

            cy.contains("Global Feed").click()
            cy.get('.article-preview').first().click()
            cy.get('.article-actions').contains('Delete Article').click()
         
            //3 To confirm the element created then removed does not exist in the list of articles
            cy.request({

              url: "https://api.realworld.io/api/articles?limit=10&offset=0",
              headers: {
                'Authorization': 'Token '+token},
              method: "GET"

            }).its('body').then( body => {
                console.log(body)
                expect(body.articles[0].title).not.to.equal('REQUEST FROM API test 3')

            })
       })


     })

})