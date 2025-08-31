# ✅ Final Security Test Report

**Project:** Lab Time Booking Backend  
**Date:** 2025-06-21  
**Conducted By:** Pratyush Tiwari  
**Tool Used:** OWASP ZAP Docker Baseline

---

## 🔍 Scan Details

- **Target URL:** http://host.docker.internal:4000
- **Scan Mode:** Passive (Baseline)
- **Tool Version:** zaproxy latest (Docker)
- **Command Used:**
  ```bash
  docker run -v "$(Get-Location):/zap/wrk" -t ghcr.io/zaproxy/zaproxy zap-baseline.py -t http://host.docker.internal:4000 -g gen.conf -r zap-report.html
