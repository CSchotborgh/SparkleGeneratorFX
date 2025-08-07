# Changelog

All notable changes to SparkleGeneratorFX™ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub documentation and workflow diagrams
- Comprehensive architecture documentation
- Deployment guide for multiple platforms
- Contributing guidelines with Git workflow

## [2.0.0] - 2025-08-07

### Added
- **Multiple Draggable Images Support**: Users can now upload and manage multiple images simultaneously
- **Independent Sprite Emitters**: Each uploaded image acts as an independent particle emitter
- **Enhanced Image Management**: New `ImageManager` class for coordinated multi-image handling
- **Scalable Emitter Architecture**: Support for unlimited number of sprite-based emitters
- **Individual Image Controls**: Each image has its own resize handles and close button
- **Multi-Select File Upload**: Support for uploading multiple images at once

### Changed
- **BREAKING**: Replaced single `window.spriteEmitter` with `window.spriteEmitters` Map collection
- **Particle System**: Modified `Particle` class to track sprite associations via `spriteId`
- **Emitter Management**: Enhanced `Emitter` class to support sprite-specific positioning
- **Positioning System**: Overlay emitters are no longer constrained to canvas center
- **Performance**: Optimized particle distribution across multiple emitters

### Fixed
- **Positioning Bug**: Resolved overlay emitter positioning offset calculation
- **Memory Leaks**: Proper cleanup when images are removed
- **Attraction Forces**: Fixed particle attraction to work with multiple independent emitters
- **Event Handling**: Improved event cleanup for draggable images

### Technical Details
- Backward compatibility maintained for single image workflows
- Enhanced error handling for image upload and processing
- Improved memory management with proper Map cleanup
- Real-time position updates for all sprite emitters

## [1.5.0] - 2025-07-15

### Added
- **Vector Path System**: Custom particle path drawing and following
- **Advanced Export Options**: Multiple format support (JSON, XML, CSV, JavaScript)
- **Video Export Functionality**: Canvas-based animation recording
- **Interactive Tutorial System**: Guided tour using Intro.js
- **Preset Sharing System**: Community preset management

### Changed
- **UI Enhancement**: Bootstrap 5 integration for responsive design
- **Performance**: Optimized rendering loop for better frame rates
- **Code Organization**: Modular JavaScript architecture

### Fixed
- **Cross-browser Compatibility**: Improved Safari and Firefox support
- **Mobile Responsiveness**: Better touch interaction handling
- **Memory Usage**: Reduced particle object creation overhead

## [1.0.0] - 2025-06-01

### Added
- **Core Particle System**: Real-time physics simulation with Kaboom.js
- **Interactive Controls**: Real-time parameter adjustment interface
- **Physics Engine**: Advanced particle physics with multiple force types
  - Gravity and wind effects
  - Air resistance simulation
  - Turbulence using Perlin noise
  - Magnetic attraction to emitters
- **Particle Shapes**: Support for circles, squares, triangles, stars, and polygons
- **Color Customization**: Real-time color picker with hex support
- **Trail Effects**: Configurable particle trails with length control
- **Background Management**: Image upload and scaling for backgrounds
- **Preset System**: Save and load particle configurations
- **Export Functionality**: JSON export for sharing configurations

### Technical Features
- **Flask Backend**: Python web framework with SQLAlchemy
- **Database Integration**: PostgreSQL for production, SQLite for development
- **Responsive Design**: Mobile-friendly interface
- **Canvas Rendering**: HTML5 Canvas with high-performance rendering
- **Event-Driven Architecture**: Modular JavaScript component system

### Performance
- **60fps Target**: Optimized for smooth real-time simulation
- **Particle Limits**: Support for 500+ particles without degradation
- **Memory Efficiency**: Object pooling and efficient garbage collection
- **Cross-Platform**: Compatible with all modern browsers

## Development Notes

### Version Numbering
- **Major (X.0.0)**: Breaking changes or significant new features
- **Minor (0.X.0)**: New features without breaking existing functionality
- **Patch (0.0.X)**: Bug fixes and minor improvements

### Breaking Changes Policy
Breaking changes are clearly marked and include:
- Migration guide for existing configurations
- Backward compatibility period when possible
- Clear documentation of affected APIs

### Performance Benchmarks
Each release includes performance benchmarks:
- Frame rate measurements at various particle counts
- Memory usage profiling
- Cross-browser compatibility testing
- Mobile device performance validation

### Security Updates
Security-related changes are prioritized and documented:
- Input validation improvements
- Content Security Policy updates
- Dependency security patches
- Rate limiting enhancements

---

## Contributing to Changelog

When contributing to this project, please update this changelog with:

1. **Clear descriptions** of what changed
2. **Impact assessment** for users and developers
3. **Migration notes** for breaking changes
4. **Performance implications** if applicable

### Changelog Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Features that will be removed
- **Removed**: Features that were removed
- **Fixed**: Bug fixes
- **Security**: Security-related changes

### Example Entry Format

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature with clear description
- Another feature with user impact

### Changed
- BREAKING: Clear indication of breaking changes
- Performance improvement with metrics

### Fixed
- Bug fix with issue reference (#123)
- Security vulnerability patch

### Technical Details
- Implementation notes for developers
- Architecture changes
- Dependency updates
```

---

For more details about any release, see the [GitHub Releases](https://github.com/yourusername/SparkleGeneratorFX/releases) page.