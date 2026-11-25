[1mdiff --git a/backend/.gitignore b/backend/.gitignore[m
[1mindex 05b4bf4..c8b02cc 100644[m
[1m--- a/backend/.gitignore[m
[1m+++ b/backend/.gitignore[m
[36m@@ -1,4 +1,28 @@[m
[31m-venv/[m
[32m+[m
[32m+[m[32m# Python[m
 __pycache__/[m
[31m-*.pyc[m
[31m-db.sqlite3[m
[32m+[m[32m*.py[cod][m
[32m+[m[32m*.sqlite3[m
[32m+[m[32mvenv/[m
[32m+[m[32m.venv/[m
[32m+[m
[32m+[m[32m# Environment variables[m
[32m+[m[32m.env[m
[32m+[m[32m.env.*[m
[32m+[m[32m!.env.example[m
[32m+[m
[32m+[m[32m# Node[m
[32m+[m[32mnode_modules/[m
[32m+[m[32mdist/[m
[32m+[m[32mbuild/[m
[32m+[m
[32m+[m[32m# Logs[m
[32m+[m[32m*.log[m
[32m+[m
[32m+[m[32m# IDE[m
[32m+[m[32m.vscode/[m
[32m+[m[32m.idea/[m
[32m+[m
[32m+[m[32m# OS[m
[32m+[m[32m.DS_Store[m
[32m+[m[32mThumbs.db[m
[1mdiff --git a/frontend/src/pages/DashboardPage.tsx b/frontend/src/pages/DashboardPage.tsx[m
[1mindex 55d1f7b..7bccd71 100644[m
[1m--- a/frontend/src/pages/DashboardPage.tsx[m
[1m+++ b/frontend/src/pages/DashboardPage.tsx[m
[36m@@ -107,7 +107,7 @@[m [mexport function DashboardPage() {[m
             {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}[m
           </p>[m
           <h1>[m
[31m-            {greeting()}, {username} 👋[m
[32m+[m[32m            {greeting()}, {username}[m[41m [m
           </h1>[m
           <p className="muted">Here is what is happening across your student body.</p>[m
         </div>[m
