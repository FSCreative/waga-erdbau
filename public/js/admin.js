/* WAGA Admin */
(function () {
  'use strict';

  // Confirm dialogs
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      if (!window.confirm(form.getAttribute('data-confirm'))) ev.preventDefault();
    });
  });

  // Markdown toolbar
  var editor = document.querySelector('[data-md-editor]');
  document.querySelectorAll('.md-toolbar button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!editor) return;
      var token = btn.getAttribute('data-md');
      var isLine = btn.hasAttribute('data-line');
      var start = editor.selectionStart;
      var end = editor.selectionEnd;
      var v = editor.value;
      if (isLine) {
        var lineStart = v.lastIndexOf('\n', start - 1) + 1;
        editor.value = v.slice(0, lineStart) + token + v.slice(lineStart);
        editor.selectionStart = editor.selectionEnd = end + token.length;
      } else {
        var sel = v.slice(start, end) || 'Text';
        editor.value = v.slice(0, start) + token + sel + token + v.slice(end);
        editor.selectionStart = start + token.length;
        editor.selectionEnd = start + token.length + sel.length;
      }
      editor.focus();
    });
  });
})();
