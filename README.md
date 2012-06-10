freshbone
=========

web application framework for building freshbooks applications based on its public API. This framework was build as a layer on top of Backbone.js.

**This Framework is under development and is currently not considered stable.**

Freshbooks public API - XML Requests
------------------------------------

- Backbone works well with Restful JSON APIs, but Freshbooks API is not Restful (yet) and works only with XML. Freshbone hooks the necessary pieces so that the application developer doesn't have to deal with that in his application.

e.g: to fetch model:

        var staff = new Freshbone.Model({'staff_id' : 1});
        staff.fetch({
            success : function(model, resp) {
                console.log(model.attributes);
            }
        });

Freshbooks public API - XML Responses
-------------------------------------

- Backbone expects a JSON response and parse it as a JavaScript object, but Freshbooks sends back an XML response, so the framework takes care of properly parsing the response sent into the appropriate JavaScript objects.

e.g: access staff member information

        var staff = new Freshbone.Model({'staff_id' : 1});
        staff.fetch({
            success : function(model, resp) {
                console.log(model.attributes);
            }
        });

Freshbone API Errors
--------------------

- Backbone expect erros to be HTTP Response failures, but Freshbooks sends API errors as valid HTTP responses, so Freshbone hooks into the appropriate methods to make sure the right event handlers are called and that they have access to an error object containing information about the error.

e.g: fetching an inxisting staff member

        var staff = new Freshbone.Model({'staff_id' : 1});
        staff.fetch({
            success : function(model, resp) {
                ...
            },
            error : function(model, resp, xhr) {
                console.log(resp.error);
            }
        });

Freshbone Local Caching
-----------------------

- Backbone requests always triggers an Ajax call to process the data (read, create, update, delete). But for Freshbooks we want to deliver to the end-user a better experience on our applications, so we decided to implement a local caching layer on top of Backbone, so that we can reuse already fetched data. The local caching has two layers: **memory** - for fast access to the lastest list api call, and **localStorage** where all api list calls are stored, if a resource is not avaialble in any of those layers the framework will issue an Ajax call keeping the local caching updated.

Freshbone Pages
---------------

- This component is responsible for managing application pages (basically screens of the application), each page will have one or many views associated with it, and a page can register subpages making easier the management of nested pages. The Page object extends from the View object.

Freshbone Forms
---------------

- This object is responsible for html form serialization, input validation and for converting form data into a valid Model.

Freshbone Transition
--------------------

- This object is responsible for managing the screen transitions of Freshbone applications, making sure the origin and destination pages stay in the desired state.

