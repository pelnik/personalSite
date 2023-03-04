const express = require('express');
const morgan = require('morgan');
const PORT = 3000;

const app = express();

app.use(morgan('common'));
app.use(express.static('build'));

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
