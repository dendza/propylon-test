# Propylon Document Manager Assessment Solution Handover

## Backend

In this part of the document I will focus on explaining some of the backend 
functionalities that I find important to mention, and their implementation. I won't be going through 
all the task requirements and write about how those are implemented in the code, because most are
very obvious, but there are some implementation details that i would like to bring to attention

### Document retrieval method

Documents are retrieved using the [`get_file_by_url`](src/propylon_document_manager/file_versions/api/views.py)
method. It allows for the desired document url to be passed as the lookup when fetching the files from DB.
Based on the model structure the most obvious solution would be to just use the out of the box RetrieveModelMixin
and fetch files by `id`. While this would work without any issues, there are some limitations to this
approach. One of them being that you would never be able to just use the user defined document URL for
accessing the file. Client would always have to some details about the document (like `id`,) which are
not know to application user, before it can load it, which would limit the usability (e.g. can't paste the 
documetn URL in the browser and get the file).


### Content Addressable Storage endpoint

In order to demonstrate Content Addressable Storage mechanism I added a feature to search for
files based on content. User is able to retrieve any version of any document where content matches the
content of the file that was selected for search


### Read Write permissions enforcement

To be able to demonstrate some basic Read/Write permissions enforcement i implemented a new feature 
to share files with other users. I'm aware that basic task requirement was that users can not access
the files uploaded by other users, and that is still the case in my implementation. Unless files are 
explicitly shared with another user, they are inaccessible to anyone else other than the owner. What I
implemented was granting the Read permission to some user while Write permission stays reserved for the 
owner of the file. User is able to pick a specific revision to share.


## Frontend

### File diff viewer

I managed to implement a diff viewer to work with text files before i run out of time for completing the task.
Adding the support for PDFs is doable, but would require more time to do. In this version though you
can look at the diff between to revisions of text files. Only documents with multiple revisions will be available for
selection, so in order to test it just make sure that you have multiple revisions of the document on one URL
