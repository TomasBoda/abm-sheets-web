// Mock for compostjs to avoid ES module issues in Jest
module.exports = {
    Compost$$$createSvg: jest.fn(),
    EventHandler: jest.fn(),
    HorizontalAlign: jest.fn(),
    VerticalAlign: jest.fn(),
    Derived$$$Bar: jest.fn(),
    Derived$$$Column: jest.fn(),
    Derived$$$Font: jest.fn(),
    Derived$$$StrokeColor: jest.fn(),
    Derived$$$FillColor: jest.fn(),
    Shape: jest.fn(),
    Scale: jest.fn(),
    categorical: jest.fn(),
    continuous: jest.fn(),
    Value: jest.fn(),
};
