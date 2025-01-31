export const formatTypes = {
  BOLD: 'bold',
  CODE: 'code',
  README: 'readme',
  LIST: 'list',
  NORMAL: 'normal'
};

export const formatResponse = (text) => {
  if (typeof text !== 'string') {
    console.error('formatResponse received non-string input:', text);
    return {
      type: formatTypes.NORMAL,
      content: ''
    };
  }

  text = text.trim();

  if (text.startsWith('***') && text.endsWith('***')) {
    return {
      type: formatTypes.BOLD,
      content: text.slice(3, -3).trim()
    };
  }

  if (text.startsWith('```') && text.endsWith('```')) {
    const codeContent = text.slice(3, -3).trim();
    const firstLineBreak = codeContent.indexOf('\n');
    const language = firstLineBreak > -1 ? codeContent.slice(0, firstLineBreak).trim() : '';
    const code = firstLineBreak > -1 ? codeContent.slice(firstLineBreak + 1).trim() : codeContent;

    return {
      type: formatTypes.CODE,
      language,
      content: code
    };
  }

  if (text.startsWith('# README')) {
    return {
      type: formatTypes.README,
      content: text
    };
  }

  if (text.startsWith('- ') || /^\d+\.\s/.test(text)) {
    return {
      type: formatTypes.LIST,
      content: text
    };
  }

  return {
    type: formatTypes.NORMAL,
    content: text
  };
};
