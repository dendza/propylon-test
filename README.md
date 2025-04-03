# Propylon Document Manager Assessment

## Getting Started
### API Development
The API project is a [Django/DRF](https://www.django-rest-framework.org/) project that utilizes a [Makefile](https://www.gnu.org/software/make/manual/make.html) for a convenient interface to access development utilities. This application uses [SQLite](https://www.sqlite.org/index.html) as the default persistence database. This project requires Python 3.11 in order to create the virtual environment.  You will need to ensure that this version of Python is installed on your OS before building the virtual environment.  Running the below commmands should get the development environment running using the Django development server.
1. `$ make build` to create the virtual environment.
2. `$ make serve` to start the development server on port 8001.

To run the tests you can use`$ make test`

### Populating the DB
Once you have the development environment running, in order to use client app you will need to add users
to the DB. You can do that by manually running the management command 

`$ python manage.py add_user --email={user_email} --password={user_pass} --name={user_name}`

or you can use already prepared set of 3 test users within the Makefile, and import them with

`$ make add-test-users `


### Client Development 
The client project is a [Create React App](https://create-react-app.dev/) that has been tested against [Node v18.19.0 Hydrogen LTS](https://nodejs.org/download/release/v18.19.0/).  An [.nvmrc](https://github.com/nvm-sh/nvm#calling-nvm-use-automatically-in-a-directory-with-a-nvmrc-file) file has been included so that the command `$ nvm use` should select the correct NodeJS version through NVM.
1. Navigate to the client/doc-manager directory.
2. `$ npm install` to install the dependencies.
3. `$ npm start` to start the React development server.


## Additional documentation

You can find additional information about the solution in the `SOLUTION_HANDOVER.md` document


##
[![Built with Cookiecutter Django](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter-django/)
