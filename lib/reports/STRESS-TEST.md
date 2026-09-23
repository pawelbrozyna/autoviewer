# PDF stress-test

Development-only suite for the free 2-page PDF and the paid Full Report mock.

## Command

```bash
npm run pdf:stress-test
```

This generates all free stress-test cases, paid mock reports, optional PNG renders, and an index.

## Output

`test-output/pdf-stress/`

This folder is gitignored. Regenerate it with the command above.

## Free overflow rules

- MOT history: latest 6 tests. Extra rows become `+ N earlier MOT records available online`.
- Mileage history: latest 6 readings, with the same style of remainder note.
- Advisories and notes: latest 4 entries, remainder available in the online report.
- Browser reports are not truncated.

## Paid mock

The Full Report generator is a design mock only. It is not wired to payments, production APIs, or live customer data.

- Page 1: premium overview
- Page 2: MOT, mileage, advisories, specification
- Page 3: finance, write-off, stolen, keepers, recalls
- Page 4 only when keeper timeline > 5, recalls > 2, or finance + write-off + 6 or more keepers

## Visual checks

pdf-lib does not expose reliable text bounding boxes for overlap detection. Page-count, metadata, link, and runtime checks are automated. Overflow, clipping, and spacing are reviewed from the PNG renders in `test-output/pdf-stress`.
