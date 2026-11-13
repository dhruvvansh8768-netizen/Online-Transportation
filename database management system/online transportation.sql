select * from employees;

SELECT COUNT(*) AS total_employees, SUM(salary) AS total_salary, 
       ROUND(AVG(salary), 2) AS avg_salary, 
       MAX(salary) AS max_salary, MIN(salary) AS min_salary 
FROM employees; 

SELECT COUNT(*) AS total_rows, COUNT(city) AS with_city, 
       COUNT(email) AS with_email, COUNT(DISTINCT city) AS distinct_cities FROM employees; 

SELECT COUNT(*) AS emp_count, ROUND(AVG(salary), 2) AS avg_salary 
FROM employees 
WHERE department_id = 1; 

SELECT department_id, COUNT(*) AS emp_count, 
       ROUND(AVG(salary), 2) AS avg_salary, MAX(salary) AS max_salary 
FROM employees 
GROUP BY department_id 
ORDER BY department_id; 

SELECT d.name AS department, COUNT(e.id) AS emp_count, 
       SUM(e.salary) AS total_salary 
FROM departments d 
LEFT JOIN employees e ON d.id = e.department_id 
GROUP BY d.id, d.name 
ORDER BY d.id; 

SELECT category_id, COUNT(*) AS book_count, ROUND(AVG(price), 2) AS avg_price 
FROM books 
GROUP BY category_id 
ORDER BY category_id; 
