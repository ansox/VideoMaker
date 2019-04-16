const readline = require('readline-sync');
const robots = {
  text: require('./robots/text.js')
}

function start() {
  const content = {};

  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  robots.text(content)

  function askAndReturnSearchTerm() {
    return readline.question('Type a Wikipedia searchterm: ')
  }

  function askAndReturnPrefix() {
    const prefixes = ['Who is', 'What is', 'The history of'];

    const selectedPrefixIndex = readline.keyInSelect(prefixes);

    return prefixes[selectedPrefixIndex];
  }

  console.log(content);
}

start()