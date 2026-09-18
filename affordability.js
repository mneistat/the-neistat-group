(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var money = function (value) { return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); };
  var fields = { price: $('priceInput'), down: $('downInput'), term: $('termSelect'), rate: $('rateInput'), tax: $('taxInput'), insurance: $('insuranceInput'), hoa: $('hoaInput') };
  var labels = { price: 'Home price', down: 'Down payment', term: 'Loan term', rate: 'Interest rate', tax: 'Property tax', insurance: 'Insurance', hoa: 'HOA' };
  var errors = {};
  var lastResult;
  var view = 'yearly';
  var wrap = $('amortWrap');
  var toggle = $('amortToggle');
  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    var message = document.createElement('span');
    message.id = field.id + 'Error';
    message.className = 'calc-field-error';
    field.insertAdjacentElement('afterend', message);
    field.setAttribute('aria-describedby', message.id);
    errors[key] = message;
    field.addEventListener('input', function () {
      if (key === 'price' && field.checkValidity()) $('priceRange').value = field.value;
      if (key === 'down' && field.checkValidity()) $('downRange').value = field.value;
      update();
    });
  });
  ['price', 'down'].forEach(function (key) {
    $(key + 'Range').addEventListener('input', function () { fields[key].value = this.value; update(); });
  });
  var buyerPrice = $('buyerPrice');
  buyerPrice.addEventListener('input', function () { buyerPrice.dataset.userEdited = 'true'; });
  function update() {
    var input = {};
    var invalid = [];
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      var number = field.value.trim() === '' ? NaN : Number(field.value);
      var valid = field.checkValidity() && Number.isFinite(number);
      field.setAttribute('aria-invalid', String(!valid));
      errors[key].textContent = valid ? '' : (field.min !== '' && field.max !== ''
        ? 'Enter a value from ' + Number(field.min).toLocaleString() + ' to ' + Number(field.max).toLocaleString() + '.'
        : 'Enter a number of zero or more.');
      if (!valid) invalid.push(labels[key]);
      input[key] = number;
    });
    if (invalid.length) {
      $('calcError').textContent = 'Showing the last valid estimate. Check: ' + invalid.join(', ') + '.';
      return;
    }
    try { lastResult = window.NeistatMortgage.calculate(input); }
    catch (_) { $('calcError').textContent = 'Check the amounts entered before using this estimate.'; return; }
    $('calcError').textContent = '';
    $('priceDisplay').textContent = money(input.price);
    $('downDisplay').textContent = input.down + '% · ' + money(input.price * input.down / 100);
    $('priceRange').setAttribute('aria-valuetext', money(input.price));
    $('downRange').setAttribute('aria-valuetext', input.down + ' percent');
    $('monthlyPayment').innerHTML = money(lastResult.monthly) + '<small>/mo</small>';
    $('piDisplay').textContent = money(lastResult.pi);
    $('taxDisplay').textContent = money(input.tax / 12);
    $('insuranceDisplay').textContent = money(input.insurance / 12);
    $('hoaDisplay').textContent = money(input.hoa);
    $('hoaRow').style.display = input.hoa > 0 ? 'flex' : 'none';
    $('loanDisplay').textContent = money(lastResult.loan);
    $('totalInterestDisplay').textContent = money(lastResult.totalInterest);
    $('pmiNote').hidden = input.down >= 20;
    if (!buyerPrice.dataset.userEdited) buyerPrice.value = input.price;
    if (!wrap.hidden) buildSchedule();
  }
  function cells(row) {
    return '<td>' + money(row.payment) + '</td><td>' + money(row.principal) + '</td><td>' + money(row.interest) + '</td><td>' + money(row.balance) + '</td>';
  }
  function buildSchedule() {
    if (!lastResult) return;
    var rows = window.NeistatMortgage.schedule(lastResult);
    var body = $('amortBody');
    body.replaceChildren();
    if (view === 'monthly') {
      body.innerHTML = rows.map(function (row) { return '<tr><th scope="row">Month ' + row.month + '</th>' + cells(row) + '</tr>'; }).join('');
      return;
    }
    for (var i = 0; i < rows.length; i += 12) {
      var months = rows.slice(i, i + 12);
      var totals = months.reduce(function (sum, row) {
        sum.payment += row.payment; sum.principal += row.principal; sum.interest += row.interest; sum.balance = row.balance; return sum;
      }, { payment: 0, principal: 0, interest: 0, balance: 0 });
      var year = i / 12 + 1;
      var row = document.createElement('tr');
      row.className = 'amort-year-row';
      row.innerHTML = '<th scope="row"><button type="button" class="amort-year-button" aria-expanded="false" aria-controls="' + months.map(function (m) { return 'amort-month-' + m.month; }).join(' ') + '">Year ' + year + ' <span aria-hidden="true">+</span></button></th>' + cells(totals);
      body.appendChild(row);
      var monthRows = months.map(function (month) {
        var tr = document.createElement('tr');
        tr.id = 'amort-month-' + month.month;
        tr.hidden = true;
        tr.innerHTML = '<th scope="row">Month ' + month.month + '</th>' + cells(month);
        body.appendChild(tr);
        return tr;
      });
      wireYear(row.querySelector('button'), monthRows);
    }
  }
  function wireYear(button, rows) {
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      button.querySelector('span').textContent = open ? '−' : '+';
      rows.forEach(function (row) { row.hidden = !open; });
    });
  }
  toggle.addEventListener('click', function () {
    var open = wrap.hidden;
    wrap.hidden = !open;
    wrap.classList.toggle('show', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? 'Hide Amortization Schedule' : 'View Amortization Schedule';
    if (open) buildSchedule();
  });
  document.querySelectorAll('.amort-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      view = tab.dataset.view;
      document.querySelectorAll('.amort-tab').forEach(function (item) {
        var active = item === tab;
        item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));
      });
      buildSchedule();
    });
  });
  document.querySelectorAll('.faq-item').forEach(function (item, i) {
    var button = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    answer.id = 'faq-answer-' + i; answer.hidden = true;
    button.setAttribute('aria-controls', answer.id); button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', function () {
      var open = answer.hidden;
      answer.hidden = !open; item.classList.toggle('open', open); button.setAttribute('aria-expanded', String(open));
    });
  });
  update();
})();
