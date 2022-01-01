with import <nixpkgs> {};

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
  ];

}
