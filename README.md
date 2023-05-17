<h1 align="center">About API</h1>
<h2>Technogies stack:</h2>
<ul>
  <li>Nest.js / TypeScript</li>
  <li>PostgreSQL (pure SQL)</li>
  <li>Swagger</li>
</ul>
<h2 align="center">Key features</h2>
  <ul>
    <li>Database seeding with fake data via pure SQL</li>
    <li>Check if car is available for the requested period</li>
    <li>Calculate the cost of the lease for the requested period</li>
    <li>Create a car rental session</li>
    <li>Get report about car/cars usage per month</li>
  </ul>
<h2 align="center">Price calculation principles</h2>
<ul>
  <li>Basic Plan: 100$ per day</li>
  <li>1st - 4th day: Basic => 100$</li>
  <li>5th - 9th day: Basic - 5% => $95</li>
  <li>10th - 17th day: Basic - 10% => $90</li>
  <li>18th - 29th day: Basic - 15% => $85</li>
</ul>
<p><b>Example: </b> 15 days => $1415</p>
<p><b>Maximum amount of days</b>: 30</p>
<h2 align="center">API installation and run instructions</h1>
<hr>
<ul>
  <li>Clone repository</li>
  <li>Create .env file. Take example.env as example</li>
  <li>Build docker container via: <code>docker compose up --build</code></li>
  <li>Open browser at http://localhost:3000/api/docs</li>
</ul>
