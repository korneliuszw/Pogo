{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    php82
    php82Packages.composer
    nodejs-19_x
    nodePackages.pnpm
  ];
}
