#!/usr/bin/env node

import { program } from "commander"

program
  .description("HunDi cli")
  .version("1.0.0")
  .command("bundle", "bundle project", { executableFile: "command/bundle" })
  .alias("b")
  .parse(process.argv)
