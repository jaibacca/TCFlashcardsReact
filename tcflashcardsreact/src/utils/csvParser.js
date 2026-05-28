export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const entry = {};
    
    headers.forEach((header, i) => {
      entry[header] = values[i] || '';
    });
    
    entry.id = index;
    return entry;
  });
  
  return data;
};

const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

export const groupByBook = (data) => {
  const books = {};
  
  data.forEach(entry => {
    const book = entry.Book || 'Unknown';
    if (!books[book]) {
      books[book] = {};
    }
    
    const chapter = entry.Chapter || 'Unknown';
    if (!books[book][chapter]) {
      books[book][chapter] = [];
    }
    
    books[book][chapter].push(entry);
  });
  
  return books;
};

export const filterData = (data, selectedBooks, selectedChapters) => {
  if (selectedBooks.length === 0) return data;
  
  return data.filter(entry => {
    const bookMatch = selectedBooks.includes(entry.Book);
    if (!bookMatch) return false;
    
    if (selectedChapters.length === 0) return true;
    
    const chapterKey = `${entry.Book}-${entry.Chapter}`;
    return selectedChapters.includes(chapterKey);
  });
};

export const generateMultipleChoiceOptions = (correctAnswer, allData, field, count = 4) => {
  const options = [correctAnswer];
  const used = new Set([correctAnswer]);
  
  while (options.length < count && options.length < allData.length) {
    const randomEntry = allData[Math.floor(Math.random() * allData.length)];
    const value = randomEntry[field];
    
    if (value && !used.has(value)) {
      options.push(value);
      used.add(value);
    }
  }
  
  return shuffleArray(options);
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
