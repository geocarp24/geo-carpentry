# git-backup.ps1 — Auto-backup diario a GitHub
# Repo: github.com/geocarp24/geo-carpentry
# Corre via Windows Task Scheduler — no requiere intervención manual

$repoPath = "C:\Users\Admin\OneDrive\Documents\Geo Carpentry\Memory Claude"
$logFile  = "C:\Users\Admin\OneDrive\Documents\Geo Carpentry\Memory Claude\backup.log"
$date     = Get-Date -Format "yyyy-MM-dd HH:mm"

Set-Location $repoPath

# Verificar si hay cambios
$status = git status --porcelain
if (-not $status) {
    Add-Content $logFile "[$date] No changes — skipped"
    exit 0
}

# Commit y push
git add .
git commit -m "Auto-backup $date"
$pushResult = git push 2>&1

if ($LASTEXITCODE -eq 0) {
    Add-Content $logFile "[$date] OK — pushed to GitHub"
} else {
    Add-Content $logFile "[$date] ERROR — $pushResult"
}
