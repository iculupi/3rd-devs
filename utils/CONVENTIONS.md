# Konwencje Nazewnictwa

## Pliki
- PascalCase dla nazw plików z klasami: `FileManager.ts`
- Opisowe sufiksy wskazujące na rolę: `Processor`, `Manager`, `Handler`, etc.
- Grupowanie plików w katalogi według funkcjonalności

## Klasy
- Nazwy klas w PascalCase
- Sufiksy wskazujące na odpowiedzialność:
  - `*Manager` - zarządzanie zasobami
  - `*Processor` - przetwarzanie danych
  - `*Handler` - obsługa zdarzeń
  - `*Validator` - walidacja
  - `*Client` - klienty API
  - `*Engine` - złożona logika
  - `*Service` - usługi

## Interfejsy
- Prefiks `I` dla interfejsów: `IFileManager`
- Opisowe nazwy wskazujące na kontrakt: `IDataProcessor`

## Typy
- Sufiks `Type` dla typów: `ConfigType`
- Sufiks `Options` dla opcji: `ProcessingOptions` 