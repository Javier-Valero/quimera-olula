import { useMediaQuery } from "@mui/material";
import { createElement } from "react";
import {
  Draggable as DndDraggable,
  DraggableProps,
  Droppable as DndDroppable,
  DroppableProps,
} from "@hello-pangea/dnd";
export {
  Alert,
  AppBar,
  Autocomplete,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Collapse,
  Container,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  AccordionActions as ExpansionPanelActions,
  AccordionDetails as ExpansionPanelDetails,
  AccordionSummary as ExpansionPanelSummary,
  Fab,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grow,
  Icon,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  RadioGroup,
  Select,
  Skeleton,
  Slide,
  Slider,
  Step,
  StepConnector,
  StepContent,
  StepLabel,
  Stepper,
  SvgIcon,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Toolbar,
  useMediaQuery,
  useScrollTrigger,
  Zoom
} from "@mui/material";
// Componentes de MUI 9 adaptados a la API de MUI 7 que usa el legacy (ver mui_adaptador.ts)
export {
  Avatar,
  Backdrop,
  Box,
  CardHeader,
  Checkbox,
  Dialog,
  DialogContentText,
  Drawer,
  Accordion as ExpansionPanel,
  Grid,
  Link,
  Menu,
  Popover,
  Radio,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "./mui";
export { createTheme } from "@mui/material/styles";
export { ThemeProvider, useTheme } from "@mui/material/styles";
// makeStyles compatible con @mui/styles sobre tss-react
export { makeStyles } from "./estilos";
export { LocalizationProvider as MuiPickersUtilsProvider } from "@mui/x-date-pickers";
// Pickers adaptados: traducen las props de MUI v4 que siguen usando DateField/TimeField
export { DatePicker, DateTimePicker, TimePicker } from "./pickers";
export { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
export { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
export { TreeItem, SimpleTreeView as TreeView } from "@mui/x-tree-view";
export { Chart } from "chart.js";
export { default as ChartAnnotation } from "chartjs-plugin-annotation";
export { default as clsx } from "clsx";
export * as d3 from "d3";
export {
  addDays,
  addMonths,
  differenceInDays,
  endOfMonth,
  format,
  formatRelative,
  getDay,
  isSameMonth,
  isToday,
  setDay,
  subDays,
  subMonths
} from "date-fns";
export * as localesFns from "date-fns/locale";
export { DragDropContext } from "@hello-pangea/dnd";
// Valores por defecto explícitos (heredados de react-beautiful-dnd, cuyos defaultProps ignoraba React 19)
export const Droppable = (props: DroppableProps) =>
  createElement(DndDroppable, {
    type: "DEFAULT",
    direction: "vertical",
    isDropDisabled: false,
    isCombineEnabled: false,
    ignoreContainerClipping: false,
    ...props,
  });
export const Draggable = (props: DraggableProps) =>
  createElement(DndDraggable, {
    isDragDisabled: false,
    disableInteractiveElementBlocking: false,
    shouldRespectForcePress: false,
    ...props,
  });
export { initReactI18next, Trans, useTranslation } from "react-i18next";
export { default as InfiniteScroll } from "react-infinite-scroll-component";
export { NumericFormat as NumberFormat } from "react-number-format";
export { Plot } from "./plot";
export { default as SignaturePad } from "react-signature-canvas";
export {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  Type as SwipeListType,
  TrailingActions
} from "react-swipeable-list";

export const adaptV4Theme = (v: unknown) => v;

// Alias de los Keyboard*Picker de MUI v4 (ya no existen por separado)
export {
  DatePicker as KeyboardDatePicker,
  DateTimePicker as KeyboardDateTimePicker,
  TimePicker as KeyboardTimePicker
} from "./pickers";

// //////////////////////////////////////////////////////////////////////////////////

export const isWidthUp = (breakpoint: number) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMediaQuery(theme => theme.breakpoints.up(breakpoint));
};

export const Hidden = ({ mdUp, smDown, children }: { mdUp?: boolean; smDown?: boolean; children: React.ReactNode }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hiddenMdUp = mdUp && useMediaQuery(theme => theme.breakpoints.up("md"));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hiddenSmDown = smDown && useMediaQuery(theme => theme.breakpoints.down("sm"));
  const hidden = hiddenMdUp || hiddenSmDown;

  return hidden ? null : children;
};

export { default as createCache } from "@emotion/cache";
export { CacheProvider } from "@emotion/react";

