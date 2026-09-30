/* Fixed-rate estimate math shared by the browser and regression checks. */
(function (root) {
  'use strict';
  function calculate(input) {
    var bounds = { price: [100000, 5000000], down: [0, 100], rate: [0, 15], tax: [0, Infinity], insurance: [0, Infinity], hoa: [0, Infinity] };
    Object.keys(bounds).forEach(function (key) {
      if (!Number.isFinite(input[key]) || input[key] < bounds[key][0] || input[key] > bounds[key][1]) throw new RangeError('Invalid ' + key);
    });
    if (![10, 15, 20, 30].includes(input.term)) throw new RangeError('Invalid term');
    var loan = input.price * (1 - input.down / 100);
    var rate = input.rate / 1200;
    var periods = input.term * 12;
    var pi = rate === 0 ? loan / periods : loan * rate / -Math.expm1(-periods * Math.log1p(rate));
    var monthly = pi + input.tax / 12 + input.insurance / 12 + input.hoa;
    if (!Number.isFinite(monthly)) throw new RangeError('Invalid total');
    return { loan: loan, pi: pi, monthly: monthly, totalInterest: Math.max(0, pi * periods - loan), periods: periods, rate: rate };
  }
  function schedule(result) {
    var balance = result.loan;
    return Array.from({ length: result.periods }, function (_, i) {
      var interest = balance * result.rate;
      var payment = Math.min(result.pi, balance + interest);
      var principal = Math.min(balance, Math.max(0, payment - interest));
      balance = Math.max(0, balance - principal);
      if (balance < 0.000001) balance = 0;
      return { month: i + 1, payment: payment, principal: principal, interest: interest, balance: balance };
    });
  }
  var api = { calculate: calculate, schedule: schedule };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NeistatMortgage = api;
})(typeof window === 'undefined' ? this : window);
