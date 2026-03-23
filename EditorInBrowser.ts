import { KeyboardEvent } from './browser/keyboardEvent.js';
import { IMouseEvent, IMouseWheelEvent } from './browser/mouseEvent.js';
import { IBoundarySashes } from './browser/ui/sash/sash.js';
import { Event } from './base/common/events.js';
import { MenuId } from './actions/common/actions.js';
import { IContextKeyService } from './contextKey/common/contextKey.js';
import { ServicesAccessor } from 'instantiation/common/instantiation.js';
import { ConfigurationChangedEvent, EditorLayoutInfo, EditorOption, FindComputedEditorOptionValueById,
         IComputedEditorOptions, IDiffEditorOptions, IEditorOptions, OverviewRulerPosition} from './config/editorOptions.js';
import { IDimension } from './core/2d/dimension.js';
import { TextEdit } from './core/edits/textEdit.js';
import { IPosition, Position } from './core/position.js';
import { IRange, Range } from './core/range.js';
import { Selection } from './core/selection.js';
import { IWordAtPosition } from './core/wordHelper';
import { ICursorPositionChangedEvent, ICursorSelectionChangedEvent } from './cursorEvents.js';
import { IDiffComputationResult, ILineChange } from './diff/legacyLinesDiffComputer.js';
import * as editorCommon from '../common/editorCommon.js';
import { GlyphMarginLane, ICursorStateComputer, IIdentifedSingleEditOperation, IModelDecoratin,
         IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel, PositionAffinity } from './model.js'
