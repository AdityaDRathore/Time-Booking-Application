# 📦 Dependency Audit Summary

## 🔍 Run Command
npm audit


## ✅ Fixed Issues
- Updated `helmet`, `cookie-parser`, `xss-clean` to latest versions
- Reviewed advisory: GHSA-pxg6-pf52-xh8x for `cookie < 0.7.0`

## ❗ Ignored/Deferred
- `csurf` bump to 1.2.2 would break current CSRF setup
- Will revisit with test coverage before upgrade
