const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials.json').apiKey
const sentenceBoundaryDetection = require('sbd');

async function robot(content) {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentSentences(content)

  async function fetchContentFromWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2?timeout=300');
    const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponse.get();

    content.sourceContentOriginal = wikipediaContent.content;
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeAllBlankLinesAndMarkdown(content.sourceContentOriginal);

    content.sourceContentSanitized = withoutBlankLinesAndMarkdown;

    function removeAllBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n');

      return allLines.filter(line => line.trim().length > 0 &&
        !line.trim().startsWith('='))
        .join(' ');
    }
  }

  function breakContentSentences(content) {
    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);

    content.sentences = sentences
      .map(sentence => {
        return {
          text: sentence,
          keywords: [],
          images: []
        }
      })

    console.log(content.sentences);
  }
}

module.exports = robot;