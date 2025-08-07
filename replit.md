# replit.md

## Overview

SparkleGeneratorFX™ is an interactive particle physics system and visualization engine built with Flask and Kaboom.js. The application allows users to create, customize, and share particle effects through a web-based interface. Users can manipulate particle behavior in real-time, export their creations in multiple formats, and share presets with the community. The system features advanced physics simulation, vector path drawing, image overlays, video recording capabilities, and a comprehensive tutorial system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using vanilla JavaScript with multiple specialized modules for different functionalities. The core rendering is handled by Kaboom.js for high-performance particle physics and visualization. The user interface uses Bootstrap 5 for responsive design and components, with custom CSS for particle system-specific styling.

Key frontend components include:
- **Particle System Engine** (`particle-system.js`) - Core particle physics and rendering with multiple emitter support
- **Control System** (`controls.js`) - User interface controls and parameter management  
- **Vector Path System** (`vector-path.js`) - Drawing and following custom particle paths
- **Multi-Image Management** (`draggable-image.js`) - Advanced overlay image handling with independent sprite particle emission
- **Export System** (`export.js`) - Multi-format data export (JSON, XML, CSV, JavaScript)
- **Video Recording** (`video-export.js`) - Canvas-based video capture and export
- **Tutorial System** (`tutorial.js`) - Interactive guided tour using Intro.js
- **Preset Sharing** (`preset-sharing.js`) - Community preset management

The architecture separates concerns effectively, with each JavaScript module handling specific functionality while maintaining communication through global state objects and event systems.

### Backend Architecture
The backend uses Flask with SQLAlchemy ORM for a lightweight but robust server architecture. The application follows a simple MVC pattern with route handlers directly in the main application file. The backend primarily serves the frontend application and manages preset data persistence.

Core backend components:
- **Flask Application** (`app.py`) - Main server with route definitions and database setup
- **Database Models** - SQLAlchemy models for particle preset storage
- **API Endpoints** - RESTful endpoints for preset CRUD operations
- **Static Asset Serving** - CSS, JavaScript, and image file delivery

The backend is designed to be minimal and focused, handling only essential server-side operations while letting the frontend manage the complex particle system logic.

### Data Storage Solutions
The application uses SQLite as the default database with SQLAlchemy ORM for data persistence. The database stores particle system presets including configuration parameters, metadata, and community interaction data (likes, creation dates).

Database schema includes:
- **ParticlePreset Model** - Stores preset configurations as JSON, along with metadata like name, description, creation timestamp, and like count

The system is designed to be database-agnostic through SQLAlchemy, supporting easy migration to PostgreSQL or other databases through environment configuration.

### Authentication and Authorization
Currently, the application operates without user authentication, allowing anonymous preset creation and sharing. This design choice prioritizes accessibility and ease of use for creative experimentation. Future implementations could add user accounts while maintaining the current open access model.

## External Dependencies

### Frontend Libraries
- **Kaboom.js** - High-performance 2D game engine for particle physics and canvas rendering
- **Bootstrap 5** - UI framework for responsive design and components
- **Feather Icons** - Icon library for UI elements
- **Intro.js** - Interactive tutorial and onboarding system
- **particles.js** - Background particle effects (used in TSX components)
- **Framer Motion** - Animation library for React components
- **Wouter** - Lightweight routing library

### Backend Dependencies
- **Flask** - Web framework for Python
- **Flask-SQLAlchemy** - Database ORM integration
- **SQLAlchemy** - Database abstraction layer

### Browser APIs
- **HTML5 Canvas API** - Core rendering and export functionality
- **File API** - Image upload and processing
- **Blob API** - Video export and file generation
- **Local Storage API** - Client-side data persistence

### Development and Deployment
The application is designed for deployment on Replit with environment variable configuration for database connections and security keys. The system supports both SQLite for development and PostgreSQL for production deployments.

## Recent Changes (August 2025)

### Multiple Draggable Images Support
- **Date**: August 7, 2025
- **Change**: Implemented comprehensive support for multiple draggable images with independent particle emitters
- **Impact**: Users can now upload multiple images that each act as independent sprite-based particle emitters
- **Technical Details**: 
  - Replaced single `window.spriteEmitter` with `window.spriteEmitters` Map collection
  - Created individual `Emitter` instances for each uploaded image
  - Modified `Particle` class to track sprite associations via `spriteId`
  - Updated positioning system to be independent of canvas center constraint
  - Enhanced `ImageManager` class to handle multiple file uploads simultaneously

### Architecture Improvements
- **Independent Positioning**: Overlay emitters are no longer constrained to canvas center
- **Scalable Design**: System now supports unlimited number of draggable images
- **Performance Optimization**: Efficient particle distribution across multiple emitters
- **Memory Management**: Proper cleanup when images are removed

### User Experience Enhancements
- **Multi-Select Upload**: Users can select and upload multiple images at once
- **Individual Controls**: Each image has independent resize handles and close buttons
- **Visual Feedback**: Clear visual indicators for draggable and resizable elements
- **Real-time Updates**: Particle emission updates immediately when images are moved or resized