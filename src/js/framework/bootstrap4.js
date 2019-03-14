/* JTSage-DateBox 
 *
 * Bootstrap option overrides and 
 * basic input/output functions
 */

mergeOpts({
	theme_clearBtnCls : "outline-secondary",
	theme_clearBtnIcn : "clear",

	theme_closeBtnCls : "outline-secondary",
	theme_closeBtnIcn : "check",

	theme_cancelBtnCls : "outline-secondary",
	theme_cancelBtnIcn : "cancel",

	theme_tomorrowBtnCls : "outline-secondary",
	theme_tomorrowBtnIcn : "goto",

	theme_todayBtnCls : "outline-secondary",
	theme_todayBtnIcn : "goto",

	theme_dropdownContainer : "bg-light border border-dark mt-1",
	theme_modalContainer : "bg-light border border-dark p-2 m-0",
	theme_inlineContainer : "bg-light border border-dark my-2",

	theme_headerTheme : "bg-dark",
	theme_headerBtnCls : "outline-secondary",
	theme_headerBtnIcn : "cancel",

	theme_cal_Today       : "outline-info",
	theme_cal_DayHigh     : "outline-warning",
	theme_cal_Selected    : "outline-success",
	theme_cal_DateHigh    : "outline-warning",
	theme_cal_DateHighAlt : "outline-danger",
	theme_cal_DateHighRec : "outline-warning",
	theme_cal_Default     : "outline-primary",
	theme_cal_OutOfBounds : "outline-secondary border-0",

	theme_cal_NextBtnIcn : "next",
	theme_cal_NextBtnCls : "outline-dark",
	theme_cal_PrevBtnIcn : "prev",
	theme_cal_PrevBtnCls : "outline-dark",

	theme_dbox_NextBtnIcn : "plus",
	theme_dbox_NextBtnCls : "outline-dark",
	theme_dbox_PrevBtnIcn : "minus",
	theme_dbox_PrevBtnCls : "outline-dark",

	theme_fbox_Selected   : "success",
	theme_fbox_Default    : "light",
	theme_fbox_Forbidden  : "danger",
	theme_fbox_RollHeight : "135px",

	theme_slide_Today       : "outline-info",
	theme_slide_DayHigh     : "outline-warning",
	theme_slide_Selected    : "outline-success",
	theme_slide_DateHigh    : "outline-warning",
	theme_slide_DateHighAlt : "outline-danger",
	theme_slide_DateHighRec : "outline-warning",
	theme_slide_Default     : "outline-primary",

	theme_slide_NextBtnIcn     : "plus",
	theme_slide_NextBtnCls     : "outline-dark border-0",
	theme_slide_PrevBtnIcn     : "minus",
	theme_slide_PrevBtnCls     : "outline-dark border-0",
	theme_slide_NextDateBtnIcn : "next",
	theme_slide_NextDateBtnCls : "outline-dark border-0",
	theme_slide_PrevDateBtnIcn : "prev",
	theme_slide_PrevDateBtnCls : "outline-dark border-0",

	theme_backgroundMask : {
		position: "fixed",
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,.4)"
	},
	theme_headStyle : false,

	buttonIconDate: "calendar",
	buttonIconTime: "clock",

	disabledState  : "disabled",

	clickEvent: "click",
	tranDone: "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend"
});

JTSageDateBox.styleFunctions = {
	getIcon               : function( icon ) { return JTSageDateBox.icons.getIcon( icon ); },
	button                : function( themeClass, iconClass, contents ) {
		var retty;

		retty  = "<a href='#' role='button' class='btn btn-sm btn-" + themeClass + "'>";
		retty += ( iconClass !== false ) ? "<span>" + this.getIcon(iconClass) + "</span> " : "";
		retty += contents + "</a>";

		return retty;
	},
	buttonGroup           : function ( collapse ) {
		var cls = ( collapse === true ) ? "btn-group" : "btn-group-vertical";

		return $("<div class='" + cls + " w-100 p-1'>");
	},
	baseInputWrap         : function ( originalInput ) { 
		/* Set up a wrap around the input for styling, and return it */
		return originalInput.wrap("<div class='input-group'>").parent();
	},
	baseInputButton       : function ( iconClass, title ) {
		return "<div class='input-group-append' title='" + title + "'>" +
			"<div class='input-group-text'>" + 
			"<span>" + this.getIcon( iconClass ) + "</span>" + 
			"</div></div>";
	},
	baseInputButtonFinder : function ( originalInputWrap ) {
		return originalInputWrap.find(".input-group-append");
	},
	baseInputNoButton     : function ( originalInputWrap ) {
		originalInputWrap.addClass( "w-100" );
	},
	focusInput            : function ( originalInput ) {
		originalInput.addClass( "ui-focus" );
	},
	blurInput             : function ( originalInput ) {
		originalInput.removeClass( "ui-focus" );
	},
	widgetHeader          : function ( text, themeBar, themeIcon, iconClass ) {
		return "<div class='navbar " + themeBar + "'>" + 
			"<h5 class='text-white'>" + text + "</h5>" + 
			this.button( themeIcon + " closer", iconClass, "") + "</div>";
	},
	intHeader             : function ( text ) {
		return $(
			"<div class='my-2 text-center dbHeader'>" +
			"<h5>" + text + "</h5>" +
			"</div>"
		);
	},
	calHeader             : function ( txt, firstBtnIcn, firstBtnCls, secondBtnIcn, secondBtnCls ) {
		var returnVal = $("<div class='my-2 text-center d-flex justify-content-between'>");

		$( this.button(firstBtnCls + " mx-2 dbCalPrev", firstBtnIcn, "") ).appendTo( returnVal );
		$("<h5>" + txt + "</h5>").appendTo( returnVal );
		$( this.button(secondBtnCls + " mx-2 dbCalNext", secondBtnIcn, "") ).appendTo( returnVal );

		return returnVal;
	},
	calGrid               : function () {
		return $( "<div class='w-100 p-1'><table class='dbCalGrid w-100'></table></div>" );
	},
	calRow                : function () {
		return $( "<tr>" );
	},
	calButton             : function ( data, totalElements ) {
		var style = ( totalElements !== undefined ?
				" style='width: " + ( 100 / totalElements ) + "%'" :
				""
			),
			disable = ( data.bad ? "disabled='disabled'" : ""),
			cls = "class='dbEvent w-100 btn-sm btn btn-" + 
				data.theme + ( data.bad ? " disabled":"" ) + "'";

		return $("<td class='m-0 p-0 text-center'" + style + ">" +
			"<a href='#' " + cls + " " + disable + ">" + 
			data.displayText + 
			"</a>" + "</td>");
	},
	calNonButton          : function ( text, header, totalElements ) {
		var style = ( totalElements !== undefined ?
				" style='width: " + ( 100 / totalElements ) + "%'" :
				""
			),
			cls = ( header ) ? " font-weight-bold" : "";

		return $("<td class='m-0 p-0 text-center" + cls + "'" + style + ">" + text + "</td>");
	},
	calPickers            : function ( ranges ) {
		var returnVal = "";

		returnVal += "<div class='row my-2 mx-1'>";

		returnVal += "<div class='col-sm-8 p-0 m-0'>";
		returnVal += this._stdSel( ranges.month, "dbCalPickMonth", "form-control" );
  		returnVal += "</div>";

		returnVal += "<div class='col-sm-4 p-0 m-0'>";
		returnVal += this._stdSel( ranges.year, "dbCalPickYear", "form-control" );
  		returnVal += "</div>";

		returnVal += "</div>";

		return $(returnVal);
	},
	calDateList           : function ( listLabel, list ) {
		var returnVal = "";

		list.unshift([false, listLabel, true]);

		returnVal += "<div class='row my-2 mx-1'>";
		returnVal += this._stdSel( list, "dbCalPickList", "form-control" );
		returnVal += "</div>";

		return $(returnVal);
	},
	dboxContainer         : function () {
		return $("<div>");
	},
	dboxRow               : function () {
		return $("<div class='d-flex p-1'>");
	},
	dboxControl           : function ( prevIcn, prevCls, nextIcn, nextCls, mainCls, label ) {
		var returnVal = "";

		returnVal += "<div class='btn-group-vertical flex-fill dbBox" + mainCls + "'>";

		returnVal += this.button( nextCls + " dbBoxNext" , nextIcn, "" );
		if ( label !== null ) {
			returnVal += "<div class='w-100 form-control rounded-0 p-0 text-center' " +
				"style='height:auto'>" + label + "</div>";
		}
		returnVal += "<input type='text' ";
		returnVal += "class='form-control form-control-sm text-center px-0 rounded-0'>";
		returnVal += this.button( prevCls + " dbBoxPrev" , prevIcn, "" );

		returnVal += "</div>";

		return $(returnVal);
	},
	fboxContainer         : function ( size ) {
		return $(
			"<div class='d-flex border-top border-bottom m-2' style='height: " + 
			size + 
			"; overflow: hidden'>"
		);
	},
	fboxDurLabels         : function ( ) {
		return $(
			"<div class='d-flex mx-2 mt-2' style='margin-bottom: -8px;'>"
		);
	},
	fboxDurLabel          : function ( text, items ) {
		return $( 
			"<div class='text-center' style='width: " + ( 100 / items ) + "%'>" + 
			text + 
			"</div>"
		);
	},
	fboxRollerContain     : function () {
		return $( "<div class='flex-fill'>" );
	},
	fboxRollerParent      : function () {
		return $( "<ul class='list-group'>" );
	},
	fboxRollerChild       : function ( text, cls ) {
		return $( 
			"<li class='list-group-item p-1 text-center list-group-item-" + cls + "'>" + 
			text + 
			"</li>"
		);
	},
	fboxLens              : function () {
		return $( "<div class='p-4 border border-dark shadow mx-1'>" );
	},
	slideHeader           : function ( txt, prevBtnIcn, prevBtnCls, nextBtnIcn, nextBtnCls ) {
		var returnVal = $("<div class='my-2 text-center d-flex justify-content-between'>");

		$( this.button(prevBtnCls + " mx-2 dbSlidePrev", prevBtnIcn, "") ).appendTo( returnVal );
		$("<h5>" + txt + "</h5>").appendTo( returnVal );
		$( this.button(nextBtnCls + " mx-2 dbSlideNext", nextBtnIcn, "") ).appendTo( returnVal );

		return returnVal;
	},
	slidePickers            : function ( ranges ) {
		var returnVal = "";

		returnVal += "<div class='row my-2 mx-1'>";

		returnVal += "<div class='col-sm-8 p-0 m-0'>";
		returnVal += this._stdSel( ranges.month, "dbSlidePickMonth", "form-control" );
  		returnVal += "</div>";

		returnVal += "<div class='col-sm-4 p-0 m-0'>";
		returnVal += this._stdSel( ranges.year, "dbSlidePickYear", "form-control" );
  		returnVal += "</div>";

		returnVal += "</div>";

		return $(returnVal);
	},
	slideDateList           : function ( listLabel, list ) {
		var returnVal = "";

		list.unshift([false, listLabel, true]);

		returnVal += "<div class='row my-2 mx-1'>";
		returnVal += this._stdSel( list, "dbSlidePickList", "form-control" );
		returnVal += "</div>";

		return $(returnVal);
	},
	slideGrid               : function () {
		return $( "<div class='w-100 py-1'><table class='dbSlideGrid w-100'></table></div>" );
	},
	slideRow                : function () {
		return $( "<tr>" );
	},
	slideDateButton         : function ( data ) {
		var style   = " style='width: " + ( ( 100 / 8 ) ) + "%'",
			disable = ( data.bad ? "disabled='disabled'" : ""),
			cls     = "class='dbEventS w-100 rounded-circle btn-sm btn btn-" +
				data.theme + ( data.bad ? " disabled":"" ) + "'";

		return $("<td class='m-0 p-0 text-center'" + style + ">" +
			"<a href='#' " + cls + " " + disable + ">" + 
			"<small>" + this.__( "daysOfWeekShort")[data.dateObj.getDay()] +
			"</small><br>" + data.dateObj.getDate() +  
			"</a>" + "</td>");
	},
	slideMoveButton         : function ( eventCls, icon, theme ) {
		var style = " style='width: " + ( ( 100 / 8 ) / 2 ) + "%'",
			cls   = "class='w-100 p-1 rounded-circle btn-sm btn btn-" +
				theme + " " + eventCls + "'";

		return $(
			"<td class='m-0 p-1 text-center'" + style + ">" +
			"<a href='#' " + cls + ">" + 
			this.getIcon(icon) + "</a></td>"
		);

	},
};


JTSageDateBox.baseMode = "bootstrap4";


