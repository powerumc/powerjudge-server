const gulp = require("gulp");
const tsconfig = require("./tsconfig.json");

const outDir = tsconfig.compilerOptions.outDir;

gulp.task("copy-files", (cb) => {
    gulp.src(["config.json", "package.json"])
        .pipe(gulp.dest(outDir));

    cb();
});
