const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials.json').apiKey;
const sentenceBoundaryDetection = require('sbd');
const watsonApiKey = require('../watson.json').apikey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

async function robot(content) {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentSentences(content);
  limitMaximumSentences(content);
  await fetchKeywordsOffAllSentences(content);

  console.log(content.sentences);


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

  }


  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }

  async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise(resolve => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      },
        (error, response) => {
          if (error) {
            throw error
          }
          else {
            const keywords = response.keywords.map(keyword => keyword.text);

            resolve(keywords);
          }
        })
    })

  }

  async function fetchKeywordsOffAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
    }
  }
}

module.exports = robot; ``