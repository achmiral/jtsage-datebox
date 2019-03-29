/**
 * JTSage-DateBox
 * @fileOverview Responsible for creation / open / close / destroy of widget
 * @author J.T.Sage <jtsage+datebox@gmail.com>
 * @author {@link https://github.com/jtsage/jtsage-datebox/contributors|GitHub Contributors}
 * @license {@link https://github.com/jtsage/jtsage-datebox/blob/master/LICENSE.txt|MIT}
 * @version 5.0.0
 */

/**
 * Create the widget, called automatically on initilization
 *
 */
JTSageDateBox._create = function() {
	// Create the widget, called automatically by widget system
	$( document ).trigger( "dateboxcreate" );

	var w = this, runTmp, ranTmp,
		o = $.extend(
			this.options,
			this._getLongOptions( this.element ),
			this.element.data( "options" )
		),
		_sf = this.styleFunctions,
		/**
		 * Display elements
		 * @type {Object}
		 * @memberOf JTSageDateBox
		 * @property {object} input jQuery input element
		 * @property {object} wrap JQuery input element parent
		 * @property {object} mainWrap Control HTML wrap
		 * @property {object} intHTML Contol HTML insides
		 */
		d = {
			input    : this.element,
			wrap     : this.element.parent(),
			mainWrap : $( "<div class='dbContainer_" + this.uuid + "'>" ).css( "zIndex", o.zindex ),
			intHTML  : false
		},
		styleTag = "<style>" +
				".dbContainer_" + this.uuid + " { " +
					"touch-action: none; width: " + o.controlWidth + o.controlWidthImp + "}" +
				
				" @media (max-width: " + o.breakpointWidth + ") { " +
				".dbContainer_" + this.uuid + " { " +
					"width: 100% " + o.controlWidthImp + "} } " +

				( ( o.theme_headStyle !== false ) ? o.theme_headStyle : "" ) +
			"</style>",
		evtid = ".datebox" + this.uuid,
		touch = ( typeof window.ontouchstart !== "undefined" ),
		drag = {
			eStart : "touchstart" + evtid + " mousedown" + evtid,
			eMove  : "touchmove"  + evtid + " mousemove" + evtid,
			eEnd   : "touchend"   + evtid + " mouseup"   + evtid,
			eEndA  : [ "mouseup", "touchend", "touchcancel", "touchmove" ].join( evtid + " " ),
			move   : false,
			start  : false,
			end    : false,
			pos    : false,
			target : false,
			delta  : false,
			tmp    : false
		};

	$( "head" ).append( $( styleTag ) );

	$.extend(w, { d : d, drag : drag, touch : touch, icons : this.icons } );

	if ( o.usePlaceholder !== false ) {
		if ( o.usePlaceholder === true && w._grabLabel() !== "" ) {
			w.d.input.attr( "placeholder", w._grabLabel());
		}
		if ( typeof o.usePlaceholder === "string" ) {
			w.d.input.attr( "placeholder", o.usePlaceholder );
		}
	}

	w.firstOfGrid    = false;
	w.lastOfGrid     = false;
	w.selectedInGrid = false;

	w.cancelClose    = false;
	w.calDateVisible = true;
	w.disabled       = false;
	w.runButton      = false;
	w._date          = window.Date;
	w._enhanceDate();

	/**
	 * @member {string} baseID ID of the datebox Input
	 * @memberOf JTSageDateBox
	 */
	
	w.baseID         = w.d.input.attr( "id" );

	/**
	 * @member {object} initDate JavaScript date object, initialization date
	 * @memberOf JTSageDateBox
	 */

	w.initDate       = new w._date();
	w.initDate.setMilliseconds(0);

	/**
	 * @member {object} theDate JavaScript date object, current date
	 * @memberOf JTSageDateBox
	 */

	w.theDate = ( o.defaultValue ) ?
		w._makeDate() :
		( (w.d.input.val() !== "" ) ?
			w._makeDate( w.d.input.val() ) :
			new w._date() );

	if ( w.d.input.val() === "" ) { w._startOffset( w.theDate ); }

	w.initDone = false;

	if ( o.showInitialValue ) {
		w.d.input.val( w._formatter( w.__fmt(), w.theDate ) );
	}

	w.d.wrap = _sf.baseInputWrap.apply( w, [ w.d.input ] );
	
	if ( o.mode !== false ) {
		if ( o.buttonIcon === false ) {
			if ( o.mode.substr( 0, 4 ) === "time" || o.mode.substr( 0 ,3 ) === "dur" ) {
				o.buttonIcon = o.buttonIconTime;
			} else {
				o.buttonIcon = o.buttonIconDate;
			}
		}
	}

	if ( o.useButton ) {
		$( _sf.baseInputButton.apply( w, [ o.buttonIcon, w.__( "tooltip") ] ) )
			.on(o.clickEvent, function( e ) {
				e.preventDefault();
				if ( o.useFocus ) {
					w.d.input.focus();
				} else {
					if ( !w.disabled ) { w._t( { method : "open" } ); }
				}
			})
			.appendTo(w.d.wrap);
	} else {
		_sf.baseInputNoButton(w.d.wrap);
	}

	if ( o.hideInput ) { _sf.hideInput.apply( this ); }

	w.d.input
		.on( "focus.datebox", function(){
			_sf.focusInput(w.d.input);
			if ( w.disabled === false && o.useFocus ) {
				w._t( { method : "open" } );
			}
		})
		.on( "blur.datebox", function() {
			_sf.blurInput(w.d.input);
		})
		.on( "change.datebox", function() {
			/* 
			o.runOnBlur === function ( {oldDate, newDate, wasGoodDate} ) { 
				return {didSomething(bool), newDate};
			}
			*/
			if ( typeof o.runOnBlurCallback === "function" ) {
				runTmp = w._makeDate( w.d.input.val(), true );
				ranTmp = o.runOnBlurCallback.apply( w, [{
					oldDate     : w.theDate,
					newDate     : runTmp[0],
					wasGoodDate : !runTmp[1],
					wasBadDate  : runTmp[1]
				}]);
				if ( typeof ranTmp !== "object" ) {
					w.theDate = w._makeDate( w.d.input.val() );
					w.refresh();
				} else {
					if ( ranTmp.didSomething === true ) {
						w.d.input.val(ranTmp.newDate);
					}
					w.theDate = w._makeDate( w.d.input.val() );
					w.refresh();
				}
			} else {
				w.theDate = w._makeDate( w.d.input.val() );
				w.refresh();
			}
		})
		.on( "datebox", w._event );

	if ( o.lockInput ) {
		w.d.input.attr( "readonly", "readonly" );
	}

	// Check if mousewheel plugin is loaded
	if ( typeof $.event.special.mousewheel !== "undefined" ) {
		w.wheelExists = true;
	}

	// Disable when done if element attribute disabled is true.
	if ( w.d.input.is( ":disabled" ) ) {
		w.disable();
	}

	w.applyMinMax( false, false );

	if ( o.displayMode === "inline" || o.displayMode === "blind" ) {
		//o.useInline || o.useInlineBlind ) {
		w.open();
	}

	//Throw dateboxinit event
	$( document ).trigger( "dateboxaftercreate" );
};
