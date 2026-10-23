# Midnight Intelligence tokens

The authoritative theme is `app/midnight.css`. Dark: canvas #080F1E, surface #111D30, raised surface #18283E, text #F2F7FF, muted #A6B7CD, cyan #35D0EA, blue #6685FF. Light: canvas #F8FAFD, surface #FFFFFF, text #142338, muted #496077; accent links use darker #076B82 and #3452C4.

Legacy shell/module aliases consume these tokens, including cards, calculators, IPO and the styled-jsx MF terminal. Success, warning and danger keep distinct meanings. Do not use the accent as an implied return or verified-data indicator.

Retain the approved system font fallback rather than fetching fonts. Tabular numerals keep tables stable. Main copy uses readable line spacing. Existing page geometry and data table controls remain. The hero uses a static SVG with finite connector drawing, conceptual labels and working navigation.

The new contrast unit suite measures seven text/status tokens against all three surfaces in both themes and primary-button text. This validates the token combinations only; it does not certify every legacy custom surface, image, overlay or disabled control. Browser/assistive-technology review is still required for WCAG 2.2 AA acceptance.
