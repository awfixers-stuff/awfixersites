{
  description = "awfixersites development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        prismaEngines = pkgs.prisma-engines;
        playwrightBrowsers = pkgs.playwright-driver.browsers;
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_24
            prisma
            prisma-engines
            openssl
            playwright-test
            playwright-driver
            chromium
            direnv
          ];

          shellHook = ''
            export PRISMA_SCHEMA_ENGINE_BINARY="${prismaEngines}/bin/schema-engine"
            export PRISMA_QUERY_ENGINE_BINARY="${prismaEngines}/bin/query-engine"
            export PRISMA_FMT_BINARY="${prismaEngines}/bin/prisma-fmt"
            export OPENSSL_LIB_DIR="${pkgs.openssl.out}/lib"
            export OPENSSL_INCLUDE_DIR="${pkgs.openssl.dev}/include"
            export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

            export PLAYWRIGHT_BROWSERS_PATH="${playwrightBrowsers}"
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1
            export PLAYWRIGHT_NODEJS_PATH="${pkgs.nodejs_22}/bin/node"

            export AUTH_DATABASE_URL="''${AUTH_DATABASE_URL:-''${AUTH_PRISMA_DATABASE_URL:-}}"
          '';

          env = {
            PRISMA_SCHEMA_ENGINE_BINARY = "${prismaEngines}/bin/schema-engine";
            PRISMA_QUERY_ENGINE_BINARY = "${prismaEngines}/bin/query-engine";
            PRISMA_FMT_BINARY = "${prismaEngines}/bin/prisma-fmt";
            PLAYWRIGHT_BROWSERS_PATH = playwrightBrowsers;
          };
        };
      });
}
