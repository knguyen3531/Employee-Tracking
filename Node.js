require('dotenv').config();
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the Employee Tracker database.');
  start();
});

// Function to start the Inquirer prompts
function start() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all employees',
        'View all departments',
        'View all roles',
        'Add an employee',
        'Add a department',
        'Add a role',
        'Update an employee role',
        'Exit'
      ]
    })
    .then(answer => {
      switch (answer.action) {
        case 'View all employees':
          viewEmployees();
          break;
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          break;
      }
    });
}

// Functions for each action:

function viewEmployees() {
  const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON m.id = e.manager_id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewDepartments() {
  const query = 'SELECT * FROM department';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewRoles() {
  const query = `
    SELECT r.id, r.title, r.salary, d.name AS department
    FROM role r
    JOIN department d ON r.department_id = d.id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function addEmployee() {
  // Get roles and managers for selection in inquirer
  connection.promise().query('SELECT id, title FROM role')
    .then(([roles]) => {
      const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
      return connection.promise().query('SELECT id, first_name, last_name FROM employee');
    })
    .then(([managers]) => {
      const managerChoices = managers.map(manager => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id
      }));
      managerChoices.unshift({ name: 'None', value: null });

      return inquirer.prompt([
        {
          name: 'firstName',
          type: 'input',
          message: "What is the employee's first name?",
        },
        {
          name: 'lastName',
          type: 'input',
          message: "What is the employee's last name?",
        },
        {
          name: 'roleId',
          type: 'list',
          message: "What is the employee's role?",
          choices: roleChoices,
        },
        {
          name: 'managerId',
          type: 'list',
          message: "Who is the employee's manager?",
          choices: managerChoices,
        }
      ]);
    })
    .then(answer => {
      return connection.promise().query('INSERT INTO employee SET ?', {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id: answer.roleId,
        manager_id: answer.managerId
      });
    })
    .then(() => {
      console.log('Added employee to the database');
      start();
    })
    .catch(err => {
      console.error(err);
      start();
    });
}

function addDepartment() {
  inquirer.prompt({
    name: 'departmentName',
    type: 'input',
    message: 'What is the name of the department?',
  })
  .then(answer => {
    return connection.promise().query('INSERT INTO department SET ?', {
      name: answer.departmentName,
    });
  })
  .then(() => {
    console.log('Added department to the database');
    start();
  })
  .catch(err => {
    console.error(err);
    start();
  });
}

function addRole() {
  connection.promise().query('SELECT id, name FROM department')
    .then(([departments]) => {
      const departmentChoices = departments.map(department => ({
        name: department.name,
        value: department.id
      }));

      return inquirer.prompt([
        {
          name: 'title',
          type: 'input',
          message: 'What is the name of the role?',
        },
        {
          name: 'salary',
          type: 'input',
          message: 'What is the salary of the role?',
        },
        {
          name: 'departmentId',
          type: 'list',
          message: 'Which department does the role belong to?',
          choices: departmentChoices,
        }
      ]);
    })
    .then(answer => {
      return connection.promise().query('INSERT INTO role SET ?', {
        title: answer.title,
        salary: answer.salary,
        department_id: answer.departmentId,
      });
    })
    .then(() => {
      console.log('Added role to the database');
      start();
    })
    .catch(err => {
      console.error(err);
      start();
    });
}

function updateEmployeeRole() {
  let employees;
  let roles;
  connection.promise().query('SELECT id, first_name, last_name FROM employee')
    .then(([results]) => {
      employees = results;
      const employeeChoices = employees.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }));
      return connection.promise().query('SELECT id, title FROM role');
    })
    .then(([results]) => {
      roles = results;
      const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
      return inquirer.prompt([
        {
          name: 'employeeId',
          type: 'list',
          message: 'Which employee’s role do you want to update?',
          choices: employeeChoices
        },
        {
          name: 'roleId',
          type: 'list',
          message: 'Which role do you want to assign to the selected employee?',
          choices: roleChoices
        },
      ]);
    })
    .then(answers => {
      return connection.promise().query('UPDATE employee SET role_id = ? WHERE id = ?', [answers.roleId, answers.employeeId]);
    })
    .then(() => {
      console.log('Updated employee\'s role');
      start();
    })
    .catch(err => {
      console.error(err);
      start();
    });
}