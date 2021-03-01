import { customObject } from "./customObject";

const defs = ['type', 'input', 'schema', 'subscription', 'interface', 'union','scalar','enum'];

const TYPE_COMING = 0;

const rg_isArray = /[\]\[]/g;

export function parser(data: string[]) {
  let i = 0, item = data[i], tmp: any = null, mode: number | null = null;


  const json = customObject({});

  function next() {
    i++;
    item = data[i];
  }

  function union() {
    next();
    json.addcurr(item);
    next();
    while(item === '|' && i <= data.length)
    {
      next();
      json.out();
      json.addcurr(item);
      next();
    }
  }

  function nested(json: Record<string, any>) {
    while (true) {
      next();
      if (item === '}') return;
      else if (item === '{') {
        tmp = null;
        nested(json);
      }
      else if (item === '(') {
        json.addcurr('args');
      }
      else if (item === ')') {
        json.out();
      }
      else if (item === ':') mode = TYPE_COMING;
      else if (mode === TYPE_COMING) {
        json.current.type = item.replace(rg_isArray, '');
        json.current.array = item.match(rg_isArray) ? true : false;
        json.current.required = false;
        tmp = json.current;
        mode = null;
        json.out();
      }
      else if (item === '!') {
        tmp.required = true;
      }
      // add property name
      else {
        json.addcurr(item);
      }
    }
  }

  while (i < data.length) {
    if (item === '=') union();
    if (defs.includes(item)) {
      json.head();
      json.addcurr(item);
    } else if (item === '{') {
      nested(json);
    }
    else {
      json.addcurr(item);
    }
    next();
  }
  return json.head();
}
