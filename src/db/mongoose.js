
const mongoose = require('mongoose')

const uri = "mongodb://localhost:27017/task-manager-api";
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(uri);
}




