# SF21 Sector Card Image Manifest

Sourced 2026-05-18. Twelve unique high-resolution images for the homepage sector grid (`index.html` lines ~1258-1465). All images downloaded at `w=3000` from the Unsplash `/photos/{slug}/download?force=true` endpoint and served locally.

## Licence

All images are governed by the [Unsplash License](https://unsplash.com/license): free for commercial and non-commercial use, no attribution required. Attribution is provided below as a courtesy and to aid future audits.

## Image table

| # | Sector | Filename | Source slug | Photographer | Dimensions | File size |
|---|--------|----------|-------------|--------------|------------|-----------|
| 01 | SME Finance and Owner-managed | `sf21-sector-01-sme-finance.jpg` | `xoU52jUVUXA` | Kelly Sikkema | 3000x1721 | 545 KB |
| 02 | Public-Sector Suppliers | `sf21-sector-02-public-sector.jpg` | `Yo--RFsuEt4` | Connor Gan | 3000x4500 | 2.67 MB |
| 03 | IT-Managed Service Providers | `sf21-sector-03-msp.jpg` | `OqtafYT5kTw` | Unsplash contributor | 3000x2003 | 1.20 MB |
| 04 | Professional Services | `sf21-sector-04-professional.jpg` | `iPheGw7_UaI` | Vitaly Gariev | 3000x1688 | 501 KB |
| 05 | Construction and Built Environment | `sf21-sector-05-construction.jpg` | `Y4SnivCDU30` | Centar MURID | 3000x1688 | 1.51 MB |
| 06 | NHS and Healthcare Suppliers | `sf21-sector-06-nhs.jpg` | `ScXGSS5a9BI` | Graham Ruttan | 3000x1996 | 877 KB |
| 07 | Manufacturing and Industrial | `sf21-sector-07-manufacturing.jpg` | `wSTCaQpiLtc` | Louis Reed | 3000x2000 | 654 KB |
| 08 | Commercial Landlords and REITs | `sf21-sector-08-reits.jpg` | `Cgksb4wEGHw` | Kingrun Zhou | 3000x1827 | 1.23 MB |
| 09 | Hospitality and Retail | `sf21-sector-09-hospitality.jpg` | `ysxfAupKsdw` | Karwin Luo | 3000x2000 | 529 KB |
| 10 | Education and Research | `sf21-sector-10-education.jpg` | `c5RClDsVJuw` | Mert Kuzu | 3000x2250 | 1.56 MB |
| 11 | Charities and Third Sector | `sf21-sector-11-charities.jpg` | `QpYzFX0xwEM` | Frederick Shaw | 3000x2000 | 1.06 MB |
| 12 | Large Corporates and Groups | `sf21-sector-12-corporates.jpg` | `0sT9YhNgSEs` | Benjamin Child | 3000x2000 | 810 KB |

## Source URLs

Replace `{slug}` to view on Unsplash: `https://unsplash.com/photos/{slug}`

- 01 https://unsplash.com/photos/xoU52jUVUXA
- 02 https://unsplash.com/photos/Yo--RFsuEt4
- 03 https://unsplash.com/photos/OqtafYT5kTw
- 04 https://unsplash.com/photos/iPheGw7_UaI
- 05 https://unsplash.com/photos/Y4SnivCDU30
- 06 https://unsplash.com/photos/ScXGSS5a9BI
- 07 https://unsplash.com/photos/wSTCaQpiLtc
- 08 https://unsplash.com/photos/Cgksb4wEGHw
- 09 https://unsplash.com/photos/ysxfAupKsdw
- 10 https://unsplash.com/photos/c5RClDsVJuw
- 11 https://unsplash.com/photos/QpYzFX0xwEM
- 12 https://unsplash.com/photos/0sT9YhNgSEs

## Notes

- All 12 images are unique. No image is re-used across sector cards (previous state had 3 cards sharing `sector-retail-hospitality.jpg`, 2 sharing `sector-professional-services.jpg`, 2 sharing `sector-civic-buildings.jpg`, and 2 sharing `sector-manufacturing-industrial.jpg`).
- Images are served as `image/jpeg` only at this stage. The previous AVIF and WebP sources have been removed for the 12 cards. The CSS uses `aspect-ratio: 16/9; object-fit: cover` so the source dimensions render correctly.
- Cache-buster `v=97` is appended to all 12 `<img src>` URLs in `index.html`.
