/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env browser */

import { SECTION_STYLES } from './constants.js';

function sampleRUM(checkpoint, data) {
  // eslint-disable-next-line max-len
  const timeShift = () => (window.performance
    ? window.performance.now()
    : Date.now() - window.hlx.rum.firstReadTime);
  try {
    window.hlx = window.hlx || {};
    sampleRUM.enhance = () => { };
    if (!window.hlx.rum) {
      const param = new URLSearchParams(window.location.search).get('rum');
      const weight = (window.SAMPLE_PAGEVIEWS_AT_RATE === 'high' && 10)
        || (window.SAMPLE_PAGEVIEWS_AT_RATE === 'low' && 1000)
        || (param === 'on' && 1)
        || 100;
      const id = Math.random().toString(36).slice(-4);
      const isSelected = param !== 'off' && Math.random() * weight < 1;
      // eslint-disable-next-line object-curly-newline, max-len
      window.hlx.rum = {
        weight,
        id,
        isSelected,
        firstReadTime: window.performance
          ? window.performance.timeOrigin
          : Date.now(),
        sampleRUM,
        queue: [],
        collector: (...args) => window.hlx.rum.queue.push(args),
      };
      if (isSelected) {
        const dataFromErrorObj = (error) => {
          const errData = { source: 'undefined error' };
          try {
            errData.target = error.toString();
            errData.source = error.stack
              .split('\n')
              .filter((line) => line.match(/https?:\/\//))
              .shift()
              .replace(/at ([^ ]+) \((.+)\)/, '$1@$2')
              .replace(/ at /, '@')
              .trim();
          } catch (err) {
            /* error structure was not as expected */
          }
          return errData;
        };

        window.addEventListener('error', ({ error }) => {
          const errData = dataFromErrorObj(error);
          sampleRUM('error', errData);
        });

        window.addEventListener('unhandledrejection', ({ reason }) => {
          let errData = {
            source: 'Unhandled Rejection',
            target: reason || 'Unknown',
          };
          if (reason instanceof Error) {
            errData = dataFromErrorObj(reason);
          }
          sampleRUM('error', errData);
        });

        sampleRUM.baseURL = sampleRUM.baseURL
          || new URL(window.RUM_BASE || '/', new URL('https://rum.hlx.page'));
        sampleRUM.collectBaseURL = sampleRUM.collectBaseURL || sampleRUM.baseURL;
        sampleRUM.sendPing = (ck, time, pingData = {}) => {
          // eslint-disable-next-line max-len, object-curly-newline
          const rumData = JSON.stringify({
            weight,
            id,
            referer: window.location.href,
            checkpoint: ck,
            t: time,
            ...pingData,
          });
          const urlParams = window.RUM_PARAMS
            ? `?${new URLSearchParams(window.RUM_PARAMS).toString()}`
            : '';
          const { href: url, origin } = new URL(
            `.rum/${weight}${urlParams}`,
            sampleRUM.collectBaseURL,
          );
          const body = origin === window.location.origin
            ? new Blob([rumData], { type: 'application/json' })
            : rumData;
          navigator.sendBeacon(url, body);
          // eslint-disable-next-line no-console
          console.debug(`ping:${ck}`, pingData);
        };
        sampleRUM.sendPing('top', timeShift());

        sampleRUM.enhance = () => {
          // only enhance once
          if (document.querySelector('script[src*="rum-enhancer"]')) return;
          const { enhancerVersion, enhancerHash } = sampleRUM.enhancerContext || {};
          const script = document.createElement('script');
          if (enhancerHash) {
            script.integrity = enhancerHash;
            script.setAttribute('crossorigin', 'anonymous');
          }
          script.src = new URL(
            `.rum/@adobe/helix-rum-enhancer@${enhancerVersion || '^2'
            }/src/index.js`,
            sampleRUM.baseURL,
          ).href;
          document.head.appendChild(script);
        };
        if (!window.hlx.RUM_MANUAL_ENHANCE) {
          sampleRUM.enhance();
        }
      }
    }
    if (window.hlx.rum && window.hlx.rum.isSelected && checkpoint) {
      window.hlx.rum.collector(checkpoint, data, timeShift());
    }
    document.dispatchEvent(
      new CustomEvent('rum', { detail: { checkpoint, data } }),
    );
  } catch (error) {
    // something went awry
  }
}

/**
 * Setup block utils.
 */
function setup() {
  window.hlx = window.hlx || {};
  window.hlx.RUM_MASK_URL = 'full';
  window.hlx.RUM_MANUAL_ENHANCE = true;
  window.hlx.codeBasePath = '';
  window.hlx.lighthouse = new URLSearchParams(window.location.search).get('lighthouse') === 'on';

  const mainScriptDestination = '/dist/main/main.js';
  const scriptEl = document.querySelector(
    `script[src$="${mainScriptDestination}"]`,
  );
  if (scriptEl) {
    try {
      const scriptURL = new URL(scriptEl.src, window.location);
      if (scriptURL.host === window.location.host) {
        [window.hlx.codeBasePath] = scriptURL.pathname.split(
          mainScriptDestination,
        );
      } else {
        [window.hlx.codeBasePath] = scriptURL.href.split(mainScriptDestination);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}

/**
 * Auto initializiation.
 */

function init() {
  // skip if in vite's test mode
  if (typeof process !== 'undefined' && process?.env?.VITEST) {
    return;
  }

  setup();
  sampleRUM();
}

/**
 * Sanitizes a string for use as class name.
 * @param {string} name The unsanitized string
 * @returns {string} The class name
 */
function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/--+/g, '--')
      .replace(/^-|-$/g, '')
    : '';
}

/**
 * Sanitizes a string for use as a js property name.
 * @param {string} name The unsanitized string
 * @returns {string} The camelCased name
 */
function toCamelCase(name) {
  return toClassName(name).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
// eslint-disable-next-line import/prefer-default-export
function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) {
          const as = [...col.querySelectorAll('a')];
          if (as.length === 1) {
            value = as[0].href;
          } else {
            value = as.map((a) => a.href);
          }
        } else if (col.querySelector('img')) {
          const imgs = [...col.querySelectorAll('img')];
          if (imgs.length === 1) {
            value = imgs[0].src;
          } else {
            value = imgs.map((img) => img.src);
          }
        } else if (col.querySelector('p')) {
          const ps = [...col.querySelectorAll('p')];
          if (ps.length === 1) {
            value = ps[0].textContent;
          } else {
            value = ps.map((p) => p.textContent);
          }
        } else value = row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Loads a CSS file.
 * @param {string} href URL to the CSS file
 */
async function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.append(link);
    } else {
      resolve();
    }
  });
}

/**
 * Loads a non module JS file.
 * @param {string} src URL to the JS file
 * @param {Object} attrs additional optional attributes
 */
async function loadScript(src, attrs) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      if (attrs) {
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const attr in attrs) {
          script.setAttribute(attr, attrs[attr]);
        }
      }
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    } else {
      resolve();
    }
  });
}

/**
 * Retrieves the content of metadata tags.
 * @param {string} name The metadata name (or property)
 * @param {Document} doc Document object to query for metadata. Defaults to the window's document
 * @returns {string} The metadata value(s)
 */
function getMetadata(name, doc = document) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...doc.head.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((m) => m.content)
    .join(', ');
  return meta || '';
}

/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {string} [alt] The image alternative text
 * @param {boolean} [eager] Set loading attribute to eager
 * @param {Array} [breakpoints] Breakpoints and corresponding params (eg. width)
 * @returns {Element} The picture element
 */
function createOptimizedPicture(
  src,
  alt = '',
  eager = false,
  breakpoints = [
    { media: '(min-width: 600px)', width: '2000' },
    { width: '750' },
  ],
) {
  const url = !src.startsWith('http') ? new URL(src, window.location.href) : new URL(src);
  const picture = document.createElement('picture');
  const { origin, pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute(
      'srcset',
      `${origin}${pathname}?width=${br.width}&format=webply&optimize=medium`,
    );
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute(
        'srcset',
        `${origin}${pathname}?width=${br.width}&format=${ext}&optimize=medium`,
      );
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute(
        'src',
        `${origin}${pathname}?width=${br.width}&format=${ext}&optimize=medium`,
      );
    }
  });

  return picture;
}

/**
 * Set template (page structure) and theme (page styles).
 */
function decorateTemplateAndTheme() {
  const addClasses = (element, classes) => {
    classes.split(',').forEach((c) => {
      element.classList.add(toClassName(c.trim()));
    });
  };
  const template = getMetadata('template');
  if (template) addClasses(document.body, template);

  let theme = getMetadata('theme');
  if (theme && !theme.startsWith('theme-')) {
    theme = `theme-${theme}`;
  }

  if (theme) addClasses(document.body, theme);
}

/**
 * Wrap inline text content of block cells within a <p> tag.
 * @param {Element} block the block element
 */
function wrapTextNodes(block) {
  const validWrappers = [
    'P',
    'PRE',
    'UL',
    'OL',
    'PICTURE',
    'TABLE',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
  ];

  const wrap = (el) => {
    const wrapper = document.createElement('p');
    wrapper.append(...el.childNodes);
    [...el.attributes]
      // move the instrumentation from the cell to the new paragraph, also keep the class
      // in case the content is a buttton and the cell the button-container
      .filter(
        ({ nodeName }) => nodeName === 'class'
          || nodeName.startsWith('data-aue')
          || nodeName.startsWith('data-richtext'),
      )
      .forEach(({ nodeName, nodeValue }) => {
        wrapper.setAttribute(nodeName, nodeValue);
        el.removeAttribute(nodeName);
      });
    el.append(wrapper);
  };

  block.querySelectorAll(':scope > div > div').forEach((blockColumn) => {
    if (blockColumn.hasChildNodes()) {
      const hasWrapper = !!blockColumn.firstElementChild
        && validWrappers.some(
          (tagName) => blockColumn.firstElementChild.tagName === tagName,
        );
      if (!hasWrapper) {
        wrap(blockColumn);
      } else if (
        blockColumn.firstElementChild.tagName === 'PICTURE'
        && (blockColumn.children.length > 1 || !!blockColumn.textContent.trim())
      ) {
        wrap(blockColumn);
      }
    }
  });
}

/**
 * Decorates paragraphs containing a single link as buttons.
 * @param {Element} element container element
 */
function decorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        if (
          up.childNodes.length === 1
          && (up.tagName === 'P' || up.tagName === 'DIV')
        ) {
          a.className = 'button'; // default
          up.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'EM'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
      }
    }
  });
}

/**
 * Add material icon or SVG icon to a span element
 * @param {Element} span - The span element to decorate
 * @param {Array} iconsList - List of available SVG icons
 * @param {string} prefix - Optional prefix for icon path
 */
async function decorateIcon(span, iconsList, prefix = '') {
  // Extract icon name from the class (icon-name → name)
  const iconName = Array.from(span.classList)
    .find((c) => c.startsWith('icon-'))
    ?.substring(5);

  if (!iconName) return;

  // For SVG icons in the iconsList
  if (iconsList.includes(iconName)) {
    try {
      const imagePath = `${window.hlx.codeBasePath}${prefix}/icons/${iconName}.svg`;
      const response = await fetch(imagePath);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const svgText = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(
        svgText,
        'image/svg+xml',
      ).documentElement;
      span.innerHTML = svgDoc.outerHTML;
    } catch (error) {
      console.error(`Failed to load SVG icon: ${iconName}`, error);
    }
  } else {
    // Store icon name in data attribute instead of text content
    span.setAttribute('data-icon', iconName);

    // Clear any existing text to avoid duplication
    span.textContent = '';

    // There is a bug in universal editor where if the span has no content,
    // it will be removed from the DOM.
    // This is a workaround to ensure the icon is always visible.
    if (document.querySelector('[data-aue-resource]')) {
      const img = document.createElement('img');
      img.dataset.iconName = iconName;
      img.classList.add('display-none');
      // Use a 1x1 transparent pixel data URI instead of loading an external SVG
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      img.width = 1;
      img.height = 1;
      img.alt = '';
      span.append(img);
    }
  }
}

/**
 * Decorate all icon spans in an element
 * @param {Element} element - Element containing icons
 * @param {string} prefix - Optional prefix for icon path
 */
function decorateIcons(element, prefix = '') {
  // List of available SVG icons
  const iconsList = ['twitter', 'linkedin', 'facebook'];

  // Find all spans with the icon class
  const icons = [...element.querySelectorAll('span.icon')];

  // Process each icon
  icons.forEach((span) => {
    decorateIcon(span, iconsList, prefix);
  });
}

/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 */
function decorateSections(main) {
  main
    .querySelectorAll(':scope > div:not([data-section-status])')
    .forEach((section) => {
      const wrappers = [];
      let defaultContent = false;
      [...section.children].forEach((e) => {
        if ((e.tagName === 'DIV' && e.className) || !defaultContent) {
          const wrapper = document.createElement('div');
          wrappers.push(wrapper);
          defaultContent = e.tagName !== 'DIV' || !e.className;
          if (defaultContent) wrapper.classList.add('default-content-wrapper');
        }
        wrappers[wrappers.length - 1].append(e);
      });
      wrappers.forEach((wrapper) => section.append(wrapper));
      section.classList.add('section', 'nsw-section');

      section.dataset.sectionStatus = 'initialized';
      section.style.display = 'none';

      // Process section metadata
      const sectionMeta = section.querySelector('div.section-metadata');
      if (sectionMeta) {
        const meta = readBlockConfig(sectionMeta);
        Object.keys(meta).forEach((key) => {
          const lowerCaseKey = key.toLowerCase();
          const styles = SECTION_STYLES[lowerCaseKey];
          const style = styles?.find((s) => s.name.toLowerCase() === meta[key].toLowerCase());

          if (style) {
            section.classList.add(style.value);
          } else {
            // add the key to the section as a data attribute for easier debugging
            section.dataset[toCamelCase(key)] = meta[key];
          }
        });

        if (section.classList.contains('nsw-section--brand-dark') || section.classList.contains('nsw-section--brand-supplementary')) {
          section.classList.add('nsw-section--invert');
        }

        sectionMeta.parentNode.remove();
      }
    });
}

/**
 * Gets placeholders object.
 * @param {string} [prefix] Location of placeholders
 * @returns {object} Window placeholders object
 */
// eslint-disable-next-line import/prefer-default-export
async function fetchPlaceholders(prefix = 'default') {
  window.placeholders = window.placeholders || {};

  if (!window.placeholders[prefix]) {
    window.placeholders[prefix] = new Promise((resolve) => {
      fetch(`${prefix === 'default' ? '' : prefix}/.nsw/config.json`)
        .then((resp) => (resp.ok ? resp.json() : { path: '' }))
        .then((pathData) => {
          const globalPlaceholderPath = pathData.data.find((item) => item.Key === 'global-placeholders')?.Text || '';
          return Promise.all([
            // Fetch local placeholders
            fetch(`${prefix === 'default' ? '' : prefix}/placeholders.json`)
              .then((resp) => (resp.ok ? resp.json() : { data: [] }))
              .catch(() => ({ data: [] })),
            // Fetch global placeholders using the path received
            fetch(globalPlaceholderPath)
              .then((resp) => (resp.ok ? resp.json() : { data: [] }))
              .catch(() => ({ data: [] })),
          ]);
        })
        .then(([localData, globalData]) => {
          const placeholders = {};

          // Process global placeholders first
          globalData.data
            .filter((item) => item.Key)
            .forEach((item) => {
              placeholders[toCamelCase(item.Key)] = item.Text;
            });

          // Override with local placeholders if any
          localData.data
            .filter((item) => item.Key)
            .forEach((item) => {
              placeholders[toCamelCase(item.Key)] = item.Text;
            });

          window.placeholders[prefix] = placeholders;
          resolve(window.placeholders[prefix]);
        })
        .catch(() => {
          // In case of an error, fallback to empty object
          window.placeholders[prefix] = {};
          resolve(window.placeholders[prefix]);
        });
    });
  }

  return window.placeholders[prefix];
}

/**
 * Gets config object.
 * @param {string} [prefix] Location of config
 * @returns {object} Window config object
 */
// eslint-disable-next-line import/prefer-default-export
async function fetchConfig(prefix = 'default') {
  window.nswConfig = window.nswConfig || {};

  if (!window.nswConfig[prefix]) {
    window.nswConfig[prefix] = new Promise((resolve) => {
      // Fetch the path of the global config file
      fetch(`${prefix === 'default' ? '' : prefix}/.nsw/config.json`)
        .then((resp) => (resp.ok ? resp.json() : { path: '' }))
        .then((pathData) => {
          const globalConfigPath = pathData.data.find((item) => item.Key === 'global-config')?.Text || '';

          return Promise.all([
            // Fetch local config
            fetch(`${prefix === 'default' ? '' : prefix}/config.json`)
              .then((resp) => (resp.ok ? resp.json() : { data: [] }))
              .catch(() => ({ data: [] })),
            // Fetch global config using the path received
            fetch(globalConfigPath)
              .then((resp) => (resp.ok ? resp.json() : { data: [] }))
              .catch(() => ({ data: [] })),
          ]);
        })
        .then(([localData, globalData]) => {
          const config = {};

          // Process global config first
          globalData.data
            .filter((item) => item.Key)
            .forEach((item) => {
              config[toCamelCase(item.Key)] = item.Text;
            });

          // Override with local config if any
          localData.data
            .filter((item) => item.Key)
            .forEach((item) => {
              config[toCamelCase(item.Key)] = item.Text;
            });

          window.nswConfig[prefix] = config;
          resolve(window.nswConfig[prefix]);
        })
        .catch(() => {
          // In case of an error, fallback to empty object
          window.nswConfig[prefix] = {};
          resolve(window.nswConfig[prefix]);
        });
    });
  }

  return window.nswConfig[prefix];
}

/**
 * Builds a block DOM Element from a two dimensional array, string, or object
 * @param {string} blockName name of the block
 * @param {*} content two dimensional array or string or object of content
 */
function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return blockEl;
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} block The block element
 */
async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status !== 'loading' && status !== 'loaded') {
    block.dataset.blockStatus = 'loading';
    const { blockName } = block.dataset;
    try {
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(`Blocks/${blockName}/${blockName}.js`);
            if (mod.default) {
              await mod.default(block);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`failed to load module for ${blockName}`, error);
          }
          resolve();
        })();
      });
      await Promise.all([decorationComplete]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load block ${blockName}`, error);
    }
    block.dataset.blockStatus = 'loaded';
  }
  return block;
}

/**
 * Decorates a block.
 * @param {Element} block The block element
 */
function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName && !block.dataset.blockStatus) {
    block.classList.add('block');
    block.dataset.blockName = shortBlockName;
    block.dataset.blockStatus = 'initialized';
    wrapTextNodes(block);
    const blockWrapper = block.parentElement;
    blockWrapper.classList.add(`${shortBlockName}-wrapper`);
    const section = block.closest('.section');
    if (section) section.classList.add(`${shortBlockName}-container`);
    // eslint-disable-next-line no-use-before-define
    decorateButtons(block);
  }
}

/**
 * Decorates all blocks in a container element.
 * @param {Element} main The container element
 */
function decorateBlocks(main) {
  main.querySelectorAll('div.section > div > div').forEach(decorateBlock);
}

/**
 * Loads a block named 'header' into header
 * @param {Element} header header element
 * @returns {Promise}
 */
async function loadHeader(header) {
  const headerBlock = buildBlock('header', '');
  header.append(headerBlock);
  decorateBlock(headerBlock);
  return loadBlock(headerBlock);
}

/**
 * Loads a block named 'footer' into footer
 * @param footer footer element
 * @returns {Promise}
 */
async function loadFooter(footer) {
  const footerBlock = buildBlock('footer', '');
  footer.append(footerBlock);
  decorateBlock(footerBlock);
  return loadBlock(footerBlock);
}

/**
 * Wait for Image.
 * @param {Element} section section element
 */
async function waitForFirstImage(section) {
  const lcpCandidate = section.querySelector('img');
  await new Promise((resolve) => {
    if (lcpCandidate && !lcpCandidate.complete) {
      lcpCandidate.setAttribute('loading', 'eager');
      lcpCandidate.addEventListener('load', resolve);
      lcpCandidate.addEventListener('error', resolve);
    } else {
      resolve();
    }
  });
}

/**
 * Loads all blocks in a section.
 * @param {Element} section The section element
 */

async function loadSection(section, loadCallback) {
  const status = section.dataset.sectionStatus;
  if (!status || status === 'initialized') {
    section.dataset.sectionStatus = 'loading';
    const blocks = [...section.querySelectorAll('div.block')];
    for (let i = 0; i < blocks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await loadBlock(blocks[i]);
    }
    if (loadCallback) await loadCallback(section);
    section.dataset.sectionStatus = 'loaded';
    section.style.display = null;
  }
}

/**
 * Loads all sections.
 * @param {Element} element The parent element of sections to load
 */

async function loadSections(element) {
  const sections = [...element.querySelectorAll('div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadSection(sections[i]);
    if (i === 0 && sampleRUM.enhance) {
      sampleRUM.enhance();
    }
  }
}

init();

export {
  buildBlock,
  createOptimizedPicture,
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  fetchPlaceholders,
  fetchConfig,
  getMetadata,
  loadBlock,
  loadCSS,
  loadFooter,
  loadHeader,
  loadScript,
  loadSection,
  loadSections,
  readBlockConfig,
  sampleRUM,
  setup,
  toCamelCase,
  toClassName,
  waitForFirstImage,
  wrapTextNodes,
};
