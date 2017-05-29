/* global key, glotdict_version, $gp, pluralize */

/**
 * Saniitize the value striping html
 * @param {string} value
 * @returns {string} sanitized
 */
function sanitize_value(value) {
  if (typeof value.replace === 'function') {
	return value.replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
  }
  return value;
}

/**
 * Get the today with the format dd/mm/yyyy used for the update daily check
 * 
 * @returns String
 */
function gd_today() {
  var today = new Date();
  var todayn = today.getDate();
  if (todayn.length === 1) {
	todayn = '0' + todayn;
  }
  var monthn = today.getMonth() + 1;
  if (monthn.length === 1) {
	monthn = '0' + monthn;
  }
  return todayn + '/' + monthn + '/' + today.getFullYear();
}

/**
 * Get the the list of locales cached
 * 
 * @returns Array
 */
function gd_list_locales_cached() {
  var value = localStorage.getItem('gd_locales');
  if (value === '' || value === undefined) {
	value = gd_locales();
  } else {
	value = JSON.parse(value);
  }
  if(typeof value === 'string') {
	value = JSON.parse(value);
  }
  return value;
}

/**
 * Get the glossary file saved 
 * 
 * @param {string} lang The language.
 * @returns Array
 */
function gd_glossary_cached(lang) {
  if (typeof lang === 'undefined' || lang === false) {
	return;
  }
  var glossary_date_cache = localStorage.getItem('gd_glossary_date');
  var locales_cache = gd_list_locales_cached();
  window.glotdict_glossary = localStorage.getItem('gd_glossary_file');
  if (isJSON(window.glotdict_glossary)) {
	window.glotdict_glossary = JSON.parse(window.glotdict_glossary);
  }
  if (glossary_date_cache === null || glossary_date_cache === 'null' || glossary_date_cache.length === 0 || glossary_date_cache !== locales_cache[lang].time) {
	jQuery.ajax({
	  url: 'https://codeat.co/glotdict/dictionaries/' + glotdict_version + '/' + lang + '.json',
	  dataType: 'text',
	  async: false
	}).done(function (data) {
	  if (data.length > 2) {
		localStorage.setItem('gd_glossary_file', data);
		window.glotdict_glossary = JSON.parse(data);
		var glossary_date = gd_list_locales_cached();
		localStorage.setItem('gd_glossary_date', glossary_date[gd_get_lang()].time);
	  }
	});
  }
  if(typeof window.glotdict_glossary === 'string') {
	window.glotdict_glossary = JSON.parse(window.glotdict_glossary);
  }
  return window.glotdict_glossary;
}

/**
 * Get the list of locales avalaible
 * 
 * @returns Array
 */
function gd_locales() {
  window.glotdict_locales = ['ast', 'bel', 'bg_BG', 'cy', 'da_DK', 'de_DE', 'en_AU', 'en_CA', 'en_GB', 'es_ES', 'fi', 'fr_FR', 'he_IL', 'hi_IN', 'hr_HR', 'it_IT', 'ja', 'lt_LT', 'lv_LV', 'nl_BE', 'nl_NL', 'pt_BR', 'ro_RO', 'sv_SE', 'th', 'tr_TR', 'uk'];
  var locales_date_cache = localStorage.getItem('gd_locales_date');
  if (locales_date_cache === null || locales_date_cache !== gd_today()) {
	jQuery.ajax({
	  url: 'https://codeat.co/glotdict/dictionaries/' + glotdict_version + '.json',
	  dataType: 'text'
	}).done(function (data) {
	  localStorage.setItem('gd_locales', data);
	  window.glotdict_locales = JSON.parse(data);
	  localStorage.setItem('gd_locales_date', gd_today());
	});
  }
  if (locales_date_cache !== null) {
    var temp_value = JSON.parse(localStorage.getItem('gd_locales'));
    if(typeof temp_value === 'string') {
      temp_value = JSON.parse(temp_value);
    }
    window.glotdict_locales = Object.keys(temp_value);
  }
  return window.glotdict_locales;
}

/**
 * Get the language saved in GlotDict
 * 
 * @returns string
 */
function gd_get_lang() {
  if (typeof window.glotdict_lang === 'undefined') {
	var lang = localStorage.getItem('gd_language');
	if (lang === '' || lang === null) {
	  return false;
	}
	window.glotdict_lang = sanitize_value(lang);
  }
  return window.glotdict_lang;
}

/**
 * Easy way to validate the html to avoid horrible errors
 * Happen that the code generated by the extension is an horrible HTML,
 * With this function we avoid to inject that html in the page
 * @param {String} html
 * @returns {Boolean}
 */
function checkHTML(html) {
  var doc = document.createElement('div');
  doc.innerHTML = html;
  return (doc.innerHTML === html);
}

/**
 * Get the language for consistency
 * 
 * @returns string
 */
function gd_get_lang_consistency() {
  var lang = gd_get_lang();
  if (lang === 'pt_BR') {
	reallang = 'pt-br';
  } else {
	var reallang = lang.split('_');
	if (typeof reallang[1] !== 'undefined') {
	  reallang = reallang[1].toLowerCase();
	}
  }
  return reallang;
}

/**
 * Add the term in the page with the HTML code compatible with GlotPress
 * 
 * @param {string} word The term.
 * @param {string} element The div box.
 * @param {string} item The glossary term.
 * @returns void
 */
function gd_add_term_json(word, element, item) {
  if (item !== '') {
	word = word.replace(/\)/g, "\\)").replace(/\(/g, "\\(");
	// The first part in [] check for term that don't have at the left that symbol
	// The second search for the term
	// The third like the first part
	var rgxp = new RegExp('(?=^|$|[^\W\"\(\/\-])\\b(' + word + ')\\b(?=^|$|[^\w\"\)\/\-])', 'gi');
	var print = JSON.stringify(item);
	print = print.replace(/\'/g, "").replace(/\"/g, "&quot;");
	if (!item.length) {
	  print = '[' + print + ']';
	}
	var repl = '<a target="_blank" href="https://translate.wordpress.org/consistency?search=$1&amp;set=' + gd_get_lang_consistency() + '%2Fdefault"><span class="glossary-word-glotdict" data-translations="' + print + '">$1</span></a>';
	var content_html = jQuery(element).html();
	var content = content_html.replace(rgxp, repl);
	if (content !== content_html) {
	  if (checkHTML(content)) {
		jQuery('#preview-' + jQuery(element).parents().eq(2).attr('row')).addClass('has-glotdict');
		jQuery(element).html(content);
	  }
	}
  }
}

/**
 * Add links for Translation global status and Language projects archive
 * @returns void
 */
function gd_add_project_links() {
  if (jQuery('.gp-content .breadcrumb li:last-child a').length > 0) {
	var lang = jQuery('.gp-content .breadcrumb li:last-child a').attr('href').split('/');
	lang = sanitize_value(lang[lang.length - 2]);
	jQuery('.gp-content').prepend('<a style="float:right" href="https://translate.wordpress.org/locale/' + lang + '/default">' + jQuery('.gp-content .breadcrumb li:last-child a').text() + ' Projects to Translate</a>');
	jQuery('.gp-content h2:first-child').prepend('<a class="glossary-link" style="float:right;padding-left:5px;margin-left:5px;border-left: 1px solid black;" href="https://translate.wordpress.org/stats">Translation Global Status</a>');
  }
}

/**
 * Add the button to scroll to the row of the language choosen
 * @returns void
 */
function gd_add_button() {
  if (jQuery('title').text().substring(0, 27) === 'Translation status overview') {
	jQuery('.gp-content').prepend('<button style="float:right" class="gd_scroll">Scroll to ' + gd_get_lang() + '</button>');
	jQuery('.gd_scroll').on('click', function () {
	  var row = jQuery("#stats-table tr th a:contains('" + gd_get_lang() + "')");
	  row.html('<b>&nbsp;&nbsp;&nbsp;' + row.text() + '</b>');
	  jQuery('html, body').animate({scrollTop: row.offset().top - 50});
	});
  }
}

/**
 * Print the locales selector
 * 
 * @returns void
 */
function gd_locales_selector() {
  var lang = gd_get_lang();
  var lang_date = localStorage.getItem('gd_glossary_date');
  if (lang_date === null || lang_date.length === 0 || lang_date === '' || lang_date === 'null') {
	if (gd_glossary_cached(gd_get_lang())) {
	  lang_date = sanitize_value(localStorage.getItem('gd_glossary_date'));
	}
  }
  if (lang_date !== null) {
	lang_date = ' Glossary Update: ' + lang_date;
  } else {
	lang_date = '';
  }
  jQuery('.filters-toolbar:last div:first').append('<span class="separator">•</span><label for="gd-language-picker">Pick glossary: </label><select id="gd-language-picker" class="glotdict_language"></select>' + lang_date);
  jQuery('.glotdict_language').append(jQuery('<option></option>'));
  var gd_locales_array = gd_locales();
  jQuery.each(gd_locales_array, function (key, value) {
	var new_option = jQuery('<option></option>').attr('value', value).text(value);
	if (lang === value) {
	  new_option.attr('selected', true);
	}
	jQuery('.glotdict_language').append(new_option);
  });
  if (lang === '' || lang === false) {
	jQuery('.filters-toolbar:last div:first').append('<h3 style="background-color:#ddd;padding:4px;width:130px;display:inline;margin-left:4px;color:red;">&larr; Set the glossary!</h3>')
			.append('<br><h2 style="background-color:#fff;padding:0;display:block;text-align:center;margin-top: 6px;">Welcome to GlotDict! Discover the features and the hotkeys on the <a href="https://github.com/Mte90/GlotDict/blob/master/README.md#features" target="_blank">Readme</a> before to use it.</h2>');
	return;
  }
  jQuery('.glossary-word').contents().unwrap();
}

/**
 * Create the tooltip for every terms added
 * 
 * @returns void
 */
function gd_terms_tooltip() {
  var lang = gd_get_lang();
  var plural = '';
  if (lang === false) {
	return false;
  }
  var data = gd_glossary_cached(lang);
  // Loop all the editor string views
  jQuery('.editor .original').each(function () {
	var editor_in_loop = this;
	// Clean from other span
	var editor = jQuery(editor_in_loop).html().replace(/<\/?span[^>]*>/g, "");
	jQuery(editor_in_loop).html(editor);
	jQuery.each(data, function (i, item) {
	  if (i !== '&' && i !== '') {
		gd_add_term_json(i, editor_in_loop, item);
		plural = pluralize.plural(i);
		if (plural !== i && !Array.isArray(data[plural])) {
		  gd_add_term_json(plural, editor_in_loop, item);
		}
	  }
	});
  });
  jQuery('.editor .original .glossary-word-glotdict').css({'cursor': 'help', 'border-bottom': '1px dashed'});
  // Generate the HTML code for the tooltips
  jQuery('.editor').tooltip({
	items: '.editor .original .glossary-word-glotdict',
	content: function () {
	  var content = jQuery('<ul>');
	  jQuery.each(jQuery(this).data('translations'), function (i, e) {
		var def = jQuery('<li>');
		def.append(jQuery('<span>', {text: sanitize_value(e.pos)}).addClass('pos'))
				.append(jQuery('<span>', {text: sanitize_value(e.translation)}).addClass('translation'))
				.append(jQuery('<span>', {text: sanitize_value(e.comment)}).addClass('comment'));
		content.append(def);
	  });
	  return content;
	}
  });
}

/**
 * Validation is good to save time!
 * 
 * @param {object} e The event.
 * @returns void
 */
function gd_validate(e) {
  var text = jQuery('.editor:visible .original').html().slice(-1);
  var lastchar = jQuery('.editor:visible textarea').val().slice(-1);
  var hellipse = jQuery('.editor:visible .original').html().slice(-3) === '...';
  var last_dot = [';', '.', '!', ':', '、', '。', '؟', '？', '！'];
  if (hellipse) {
	if (!gd_get_setting('no_final_dot')) {
	  if (jQuery('.editor:visible textarea').val().slice(-3) === '...' || lastchar !== ';' && lastchar !== '.') {
		jQuery('.editor:visible .textareas').prepend('<div class="warning secondary"><strong>Warning:</strong> The translation contains a final <b>...</b> that needs to be translated as <b><code>&amp;hellip;</code></b></div>');
		e.stopImmediatePropagation();
		return;
	  }
	}
  } else {
	if (!gd_get_setting('no_final_other_dot')) {
	  if (jQuery.inArray(text, last_dot) === 1 && jQuery.inArray(lastchar, last_dot) === -1) {
		jQuery('.editor:visible .textareas').prepend('<div class="warning secondary"><strong>Warning:</strong> The translation it\'s missing of a final <b>.</b> or <b>?</b> or <b>!</b></div>');
		e.stopImmediatePropagation();
	  }
	}
  }
}

/**
 * Add the hotkeys in GlotPress
 * 
 * @returns void
 */
function gd_hotkeys() {
  jQuery($gp.editor.table).off('keydown', 'tr.editor textarea', $gp.editor.hooks.keydown);
  key.filter = function (event) {
	var tagName = (event.target || event.srcElement).tagName;
	key.setScope(/^(SELECT)$/.test(tagName) ? 'input' : 'other');
	return true;
  };
  key('ctrl+enter', function () {
	if (jQuery('.editor:visible').length > 0) {
	  jQuery('.editor:visible .actions button.ok').trigger('click');
	} else {
	  alert('No opened string to add!');
	}
	return false;
  });
  key('ctrl+shift+z', function () {
	if (jQuery('.editor:visible').length > 0) {
	  jQuery('.editor:visible .actions a.close').trigger('click');
	}
	return false;
  });
  key('ctrl+shift+a', function () {
	if (jQuery('.editor:visible .meta button.approve').length > 0) {
	  jQuery('.editor:visible .meta button.approve').trigger('click');
	} else {
	  alert('No opened string to approve!');
	}
	return false;
  });
  key('ctrl+shift+b', function () {
	if (jQuery('.editor:visible .copy').length > 0) {
	  jQuery('.editor:visible .copy').trigger('click');
	}
	return false;
  });
  key('ctrl+shift+f', function () {
	if (jQuery('.editor:visible .fuzzy').length > 0) {
	  jQuery('.editor:visible .fuzzy').trigger('click');
	}
	return false;
  });
  key('ctrl+shift+r', function () {
	if (jQuery('.editor:visible .meta button.reject').length > 0) {
	  jQuery('.editor:visible .meta button.reject').trigger('click');
	} else {
	  alert('No opened string to reject!');
	}
	return false;
  });
  key('ctrl+shift+f', function () {
	jQuery('textarea.foreign-text:visible:first').val(function (index, text) {
	  // Replace space-colon or nbsp-colon with just colon, then replace colons with nbsp-colon
	  var s = text.replace(/( :|&nbsp;:)/g, ':').replace(/:/g, '&nbsp;:');
	  // Fix http and https from the above replace
	  s = s.replace(/http&nbsp;:/g, 'http:').replace(/https&nbsp;:/g, 'https:');
	  // Replace space-question or nbsp-question with just question, then replace question with nbsp-question
	  s = s.replace(/( \?|&nbsp;\?)/g, '?').replace(/\?/g, '&nbsp;?');
	  // Replace space-exclamation or nbsp-exclamation with just exclamation, then replace exclamation with nbsp-exclamation
	  s = s.replace(/( !|&nbsp;!)/g, '!').replace(/!/g, '&nbsp;!');
	  // Replace space-%-space with nbsp-%-space
	  s = s.replace(/( % )/g, '&nbsp;% ');
	  // Replace space-dot-space or space-dot with just dot-space, same for comma
	  s = s.replace(/( \. | \.)/g, '. ').replace(/( , | ,)/g, ', ');
	  // Replace space-closebracket-space or space-closebracket with just closebracket-space, same for squarebracket
	  s = s.replace(/( \) | \))/g, ') ').replace(/( ] | ])/g, '] ');
	  // Replace space-openbracket-space or openbracket-space with just space-openbracket, same for squarebracket
	  s = s.replace(/( \( |\( )/g, ' (').replace(/( \[ |\[ )/g, ' [');
	  return s;
	});
	return false;
  });
  key('pageup', function () {
	if (jQuery('.editor:visible').length > 0) {
	  jQuery('.editor').next().trigger('click');
	}
	return false;
  });
  key('pagedown', function () {
	if (jQuery('.editor:visible').length > 0) {
	  jQuery('.editor').prev().trigger('click');
	}
	return false;
  });
  key('ctrl+alt+r', function () {
	localStorage.removeItem('gd_glossary_date');
	localStorage.removeItem('gd_glossary_file');
	localStorage.removeItem('gd_language');
	localStorage.removeItem('gd_locales');
	localStorage.removeItem('gd_locales_date');
	location.reload();
	return false;
  });
}

/**
 * Check if string is JSON
 * 
 * @param {string} str
 * @returns {Boolean}
 */
function isJSON(str) {
  try {
	JSON.parse(str);
  } catch (e) {
	return false;
  }
  return true;
}
