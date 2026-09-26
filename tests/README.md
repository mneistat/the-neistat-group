# Regression checks

The site remains static, with no production package dependencies. Tests use Node's test runner and a temporary DOM dependency:

```sh
npm install --prefix /tmp/neistat-checks --no-save --no-audit --no-fund jsdom@26.1.0
node --test tests/regression.test.cjs
node scripts/build-selected-work.mjs --check
git diff --check
```

Set `NEISTAT_TEST_DEPS` if jsdom is installed in a different directory. No test sends a form or loads remote scripts. Form delivery is mocked to verify validation, duplicate prevention, errors, retry, and success attribution. Real inbox delivery must be checked separately by the owner.

After an approved transaction-data change, run `node scripts/build-selected-work.mjs` and commit the generated HTML with the data file. Unverified/internal records are excluded. New neighborhood guides should use verified photographs of the area's amenities, with source, usage rights, and appropriate attribution recorded beside the image assets.
