I want CONCISE, EFFICIENT code that is 110% in code quality. CODE QUALITY SHOULD BE STELLAR

Right now there is an airtable db with all the data that I need to pull from the frontend. You'll see there is a bunch of dummy data. My teammate did some stuff with the backend so I can retrieve data from the actual airtable. Can you change one small thing, e.g. the seasons page (hard coded to 2020-2021, 2021-2022, etc) to retrieve data using the api.



Im creating a website for an organization. Here are the problems with the website that I eventually want you to fix in some order of priority (most to least). i want you to tell me advice and what you are going to do, then give me the whole file of code (don't say stuff like keep this the same) unless i specifically tell you otherwise. please keep modularity heavily in mind - i dont want files to get humongous or unreadable. then tell me the major changes you have done. wherever you can, go with a simple yet robust solution that doesnt reinvenvent the. wheel and isnt too overly complex.

- for the below requests, lmk if i have to make overhauling changes to achieve the funcionality i desire and implement them. if you lack files or context, lmk and i can provide it to you. It is helpful for both of us for all of the below if you ask qeustions, and then get a better idea of what you are going to do, tell me what you are going to do , get the get go from me, then implement it. dont provide code immediately but rather lmk of the approach you wil ltake and then ill approve or disprove. go in order of the requests below. 
- I have a lot of extraneous code or overly complex code. are there ways i can reduce complexity whilst preserving functionality? I think i have code bloat/useless files in some places - feel free to let me know and remove them
- Currently, I hardcoded many of the information fields and have no real sense of backend. i have a backend folder currently, but my partner is working on the backend. i will interact with the backend with methods like below in services.js

- Examples
    - GetLandownerInformation() ⇒ returns a json with name, contact, username, phone number, etc.
    - GetAllSeason() ⇒ returns json with all valid seasons (e.g. 24-25, 25-26)
    - GetProjectsForSeason(”24-25”) ⇒ returns json like
    - {
        - “ABCD PARK”
            - Address: 201 Lane
            - Owner: Sahil Chowdhury
            - Date: 2/24/18
            - Description: A nice area owned by “ABCD” Park
        - “Drishti’s Home”
            - Address: 21 Lane
            - Owner: Drishti Gupta
            - Date: 5/28/20
            - Description: my crib
    - }
        - For these API calls, it would be ideal if we can link an image somehow. GetProjectsForSeason
    - AddNewFolder(”24-25”) ⇒ constructs a new folder
    - AddNewProject(Year, Title (e.g. ABCD Park),  Address, Owner, Date, Description) ⇒ adds new project under year

but right now i havent actually written much in the backend. the main thing is that i would like to start switching from hardcoding data to actually making requests to services.js (which in of itself can HARDCODE FOR NOW but, you should sturcture it in a way that it is VERY easy to change in the frontend code later to pull from the database). I plan to hardcode the examples currently in the services.js but edit them to use the backend later. This way, in the frontend, i can call the API calls above just fine regardless of whether they are hardcoded or not. the frontend will not change in this way, but rather just services.js
- I know in some sense, I have to carry "context" from one webpage to the next in my code. for example, once i press the folder 24-25, i should know i am under that year. i thought one approach was to do this  via dynamic routing, so i may need to change some code in App.jsx and mess with routing a little. this in turn will also make keeping tracking context easier and backend calls easier as our context is kind of in the url. but, is this the best way? should i instead maintain a stack of webpages or something? or is dynamic routing fine for this ? let me know and then we can decide after.
- Right now, i have all these folders. They have no projects under them, but in reality i do have projects. in some way, they are not "connected" clearly as these projects would appear under one of the years. I want you to connect them somehow. Also, subpoint, i want the folders to be clickable and lead me to the page of the respective projects.
- Again, all this information here should be easily retreived from a backend hook in services.js. be sure to change it.
- A lot of the buttons aren't clickable nor do the functionality they imply. I will now give you a series of button functioanlities you should implemenet in the following orer. try to reuse code and keep modularity in mind so you dont duplicate too much code
- add new folder does nothing but should allow you to add a folder. the only parameter needs to be year (2024-2025). a scrollbar for selecting year should be fine
- add new project doesnt do anything. it should give a form that allows you to upload an image (showing one of the images i show now is completely fine, as we will tackle the image problem later. try to make it easy however to change the way we retrieve the image as this will likely be hardcoded but changed to pull from supabase later), then all the relevant data displayed in the closer view of the card. e.g. title of project, landowner information (name, email, phone), project status (status (active/inactive)), project description, project address, key metrics. in essence, we need to add the same data we are reading. 
- the attach new document doesn't actually do anything. make it attach a new document. it is fine for now if the document is always the same. but, it should look like a generic api call from the frotnend so i can easily change the functionality later.
- for the landowner side, there is no actualy text to help landowners complete the steps. i want you to just provide specific text and instructions to help the landowners proceed. in my idea, the steps would include a brief blurb or description followed by check boxes (with perhaps links or a short decription) that should all be checked. only after all of the checkboxes have been filled can we proceed to the next step. 
- we should also be able to easily remove a document. implement this functionality somehow. ALWAYS heed the generic api thing
- edit project doesnt actually allow you to edit the project
- back button brings you back to the folder selection but should bring you back to the active projects for the given year you were on.
- delete button doesnt actually delete.
- i think the documentSerivces and storageServices.js add code bloat and reinvent the wheel. how can i avoid depednences on htis whilst keeping my code clean and functional?
- the main place where i will get all this information is from AIRTABLE. i will probably interact with the airtable using the airtable javascript library. i think MOST data will come from the airtable, but not everyhting. for example, user auth for the entire app will probably need to be done separately. also, i dont know whether or not we can create images and store them using airtable. so, we are planning to use some combo of airtable and supabase with supabase being used for auth and image storage. is this a good solution? it seems to be cluttered and a be convoluated, but i couldnt find a better way

- the add new map tab doesn't work. 
- the map tab allows you to click on the image to add comments, but the comments arent stored! they should appear on the bottom.
- the upload photos and add photos button do not work at all.

- im unaware of where i can store pdfs. can i read and upload pdfs via api to and from airtable? or is supabase, like image storage, the way to go for pdf storage?
- the notificatinos tab is completely nonexistent. for the landowners, it should present outstanding notifcations per landowner.
- long term, i would like to implement a pinging/notif system. the idea is that the admin can click a user to notify, then that land ownder will receive a notif on their end. the ui for the notif page will prob be dif amongst both the landowenr and admin. 
- add some user login page. it should segregate by landowner/admin but only let landowners to sign up for now.

- the main place where i will get all this information is from AIRTABLE. i will probably interact with the airtable using the airtable javascript library. i think MOST data will come from the airtable, but not everyhting. for example, user auth for the entire app will probably need to be done separately. also, i dont know whether or not we can create images and store them using airtable. so, we are planning to use some combo of airtable and supabase with supabase being used for auth and image storage. is this a good solution? it seems to be cluttered and a be convoluated, but i couldnt find a better way
- make the treefolks logo go to the respective admin or landowner homepage (depends on who is viewing the dashboard).
- the bottom left user drop down doesnt do anything.



AGAIN, I want you to tell me your approach for tackling each priority, then get the get go from me, then implement it in the respective files, adhering to modularity (creating files if needed) and giving me the full code.

if the change is very minimal (im talking less than 2 local changes or on the order of ONLY 5-10 lines) then you dont have to give me the whole file
