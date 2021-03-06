const SINGLE = 0, BUFFERING = 1;

function isWhitespace (c: string) {
  return c === ' ' || c === '\n' || c === '\r' || c === '\t'
}

function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i);
}

var is_arg = false;

export function lexer(data: string) {

    let i = 0, c = data[i], buffer = '', mode = SINGLE, ignore = false;

    let ignoreMultipleLines = false;

    const result: string[] = [];

    function pushboth() {
      if (buffer) result.push(buffer);
      result.push(c);
      buffer = '';
      mode = SINGLE;
    }

    while (true) {
      if (i === data.length) break;

      if (c === '"')
      {
        if(data[i + 1] === '"' && data[i + 2] === '"')
        {
          i = i + 3;
          ignoreMultipleLines = !ignoreMultipleLines;
          c = data[i];
        }
      }
      if (c === '#' || c === '@' && !ignoreMultipleLines) ignore = true;

      if (!ignore && !ignoreMultipleLines) {
        switch(mode) {
          //@ts-ignore
          case SINGLE:
          if (isWhitespace(c)) break;
          if (isLetter(c)) {
            buffer += c;
            mode = BUFFERING;
            break;
          }
          case BUFFERING:
          if(c === '{') {

           if(!is_arg) result.push(c);   // ADDED if(!is_arg);
           else {                       // added this.
             while(c !== '}')
             {
               c = data[++i];
             }
           }

          } else if (c === '}') {

            result.push(c);   // ADDED ELSE

          } else if (c === ':') {
            pushboth();
          } else if (c === '!') {

            pushboth();

          } else if (c === '(') {
            is_arg = true;
            pushboth();
          } else if (c === ')') {
            is_arg = false;
            pushboth();
          } else if (c === ']') { // ADDDED These we dont care about arrays.
            // ignore ]
          } else if (c === '[') { // ADDED THESE WE DONT Care about arrays.
            // ignore []
          } else if (c === '=') { //added

            if(is_arg)
            { // can set = inside argument!
              buffer += '='
            } // could use other here.
            else pushboth();

          } else if (c === '|') { //added
            pushboth();

          } else if (c === '&') { //added
            pushboth();

          } else {
            if (isWhitespace(c)) {

              if(is_arg && data[i+1] === "=") // this whole part can be removed.
              { // tesxt = text
                i += 2;
                buffer+= "=";
                c = data[i];
                break;
              } // added this to avoid troubles with = in argument.


              if (buffer) result.push(buffer);
              buffer = '';
              mode = SINGLE;
              break;
            }
            buffer += c;
          }
        }
      } else {
        if(c === '\n' && !ignoreMultipleLines) ignore = false;
      }
      i++;
      c = data[i];
    }
    return result;
  }
