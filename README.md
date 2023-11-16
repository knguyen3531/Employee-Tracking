Overview
Employee Tracker is a command-line application built with Node.js that allows you to manage a company's employee database. With this application, you can perform operations on departments, roles, and employees, making it easier to keep track of your organization's workforce.

Features
View a list of departments, roles, and employees.
Add new departments, roles, and employees.
Update employee roles and manager assignments.
Delete departments, roles, and employees.
View the total utilized budget of a department (the combined salaries of all employees in a department).
Installation
Clone this repository to your local machine.

bash
Copy code
git clone https://github.com/your-username/employee-tracker.git
Navigate to the project directory.

bash
Copy code
cd employee-tracker
Install the required dependencies.

bash
Copy code
npm install
Configure your MySQL database connection by creating a .env file in the project root directory. Add your database credentials like this:

env
Copy code
DB_HOST=localhost
DB_USER=your-username
DB_PASSWORD=your-password
DB_DATABASE=employeeTrackerDB
Create the database schema by running the SQL script provided in schema.sql.

bash
Copy code
mysql -u your-username -p < schema.sql
You're ready to start using the Employee Tracker!

Usage
To run the application, use the following command:

bash
Copy code
npm start
Follow the prompts in the command line to perform various operations on your employee database.
