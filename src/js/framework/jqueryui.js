/* JTSage-DateBox 
 *
 * jQueryUI option overrides and 
 * basic input/output functions
 */

mergeOpts({
	themeDateToday: "ui-state-highlight",
	themeDayHigh: "",
	themeDatePick: "ui-state-active",
	themeDateHigh: "",
	themeDateHighAlt: "",
	themeDateHighRec: "",
	themeDate: "",
	themeButton: "",
	themeInput: "",

	themeClearButton: "",
	themeCancelButton: "",
	themeCloseButton: "",
	themeTomorrowButton: "",
	themeTodayButton: "",

	buttonIconDate: "calendar",
	buttonIconTime: "time",
	disabledState: "ui-state-disabled",
	
	calNextMonthIcon: "plus",
	calPrevMonthIcon: "minus",
	useInlineAlign: "left",
	useFocus: true,
	useAnimationTime: 400,

	btnCls: " ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ",
	icnCls: " ui-icon ui-icon-",

	s: {
		cal: {
			prevMonth : "<button class='ui-button ui-widget ui-state-default ui-corner-all'>" +
			"<span title='{text}' class='ui-icon ui-icon-{icon}'></span></button>",
			nextMonth : "<button class='ui-button ui-widget ui-state-default ui-corner-all'>" +
			"<span title='{text}' class='ui-icon ui-icon-{icon}'></span></button>",
			botButton : "<a href='#' class='{cls}' role='button'>" +
				"<span class='{icon}'></span> {text}</a>",
		}
	},

	useSelectMenu: false,
	clickEvent: "click",
	tranDone: "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend"
});


JTSageDateBox.baseMode = "jqueryui";
JTSageDateBox._stdBtn = {
	cancel: function() {
		var w = this, o = this.options;
		return $( "<div class='" + o.btnCls + "'>" + 
				"<span class='ui-button-text'>" + w.__("cancelButton") + "</span>" + 
				"</div>" )
			.addClass( o.themeCancelButton )
			.on(o.clickEventAlt, function (e) {
				e.preventDefault();
				w._t({ method: "close", closeCancel: true });
			});
	},
	clear: function() {
		var w = this, o = this.options;
		return $( "<div class='" + o.btnCls + "'>" + 
				"<span class='ui-button-text'>" + w.__("clearButton") + "</span>" + 
				"</div>" )
			.addClass( o.themeClearButton )
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				e.stopPropagation();
				w.d.input.val("");
				w._t( { method: "clear" } );
				w._t( { method: "close", closeCancel: true } );
			});
	},
	close: function(txt, trigger) {
		var w = this, o = this.options;

		if ( typeof trigger === "undefined" ) { trigger = false; }

		return $( "<div class='" + o.btnCls + "'>" + 
				"<span class='ui-button-text'>" + txt + "</span>" + 
				"</div>" )
			.addClass( "" +
				( ( w.dateOK === true ) ? "" : "ui-state-disabled")
			)
			.addClass( o.themeCloseButton )
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				if ( w.dateOK === true ) {
					if ( trigger === false ) {
						w._t( {
							method: "set", 
							value: w._formatter(w.__fmt(),w.theDate),
							date: w.theDate
						} );
					} else {
						w._t( trigger );
					}
					w._t( { method: "close" } );
				}
				
			});
	},
	today: function() {
		var w = this, o = this.options;
		return $("<div class='" + o.btnCls + "'>" + 
				"<span class='ui-button-text'>" + w.__("todayButtonLabel") + "</span>" + 
				"</div>")
			.addClass( o.themeTodayButton )
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				w.theDate = w._pa([0,0,0], new w._date());
				w.calBackDate = false;
				w._t( { method: "doset" } );
			});
	},
	tomorrow: function() {
		var w = this, o = this.options;
		return $("<div class='" + o.btnCls + "'>" + 
				"<span class='ui-button-text'>" + w.__("tomorrowButtonLabel") + "</span>" + 
				"</div>" )
			.addClass( o.themeTomorrowButton )
			.on(o.clickEventAlt, function(e) {
				e.preventDefault();
				w.theDate = w._pa([0,0,0], new w._date()).adj( 2, 1 );
				w.calBackDate = false;
				w._t( { method: "doset" } );
			});
	},
};

JTSageDateBox._destroy = function() {
	var w = this,
		o = this.options,
		button = this.d.wrap.find( ".input-group-addon" );


	if ( o.useButton === true ) {
		button.remove();
		w.d.input.unwrap();	
	}

	if ( o.lockInput ) {
		w.d.input.removeAttr( "readonly" );
	}

	w.d.input
		.off( "datebox" )
		.off( "focus.datebox" )
		.off( "blur.datebox" )
		.off( "change.datebox" );

	//w.d.mainWrap.popup("destroy");
		
	$( document )
		.off( w.drag.eMove )
		.off( w.drag.eEnd )
		.off( w.drag.eEndA );
};
		
JTSageDateBox._create = function() {
	// Create the widget, called automatically by widget system
	$( document ).trigger( "dateboxcreate" );

	var w = this,
		o = $.extend(
			this.options,
			this._getLongOptions( this.element ),
			this.element.data( "options" )
		),
		thisTheme = ( ( o.theme === false ) ?
			"default" :
			o.theme
		),
		d = {
			input: this.element,
			wrap: this.element.parent(),
			mainWrap: $( "<div>", { 
				"class": "ui-datebox-container"
				} ).css( "zIndex", o.zindex ),
			intHTML: false
		},
		evtid = ".datebox" + this.uuid,
		touch = ( typeof window.ontouchstart !== "undefined" ),
		drag = {
			eStart : "touchstart" + evtid + " mousedown" + evtid,
			// (touch ? "touchstart" : "mousedown" ) + evtid,
			eMove  : "touchmove" + evtid + " mousemove" + evtid,
			//(touch ? "touchmove" : "mousemove" ) + evtid,
			eEnd   : "touchend" + evtid + " mouseup" + evtid,
			//(touch ? "touchend" : "mouseup" ) + evtid,
			eEndA  : (true ?
				(["mouseup","touchend","touchcancel","touchmove"].join(evtid+" ") + evtid) :
				"mouseup" + evtid
			),
			move   : false,
			start  : false,
			end    : false,
			pos    : false,
			target : false,
			delta  : false,
			tmp    : false
		};

	$.extend(w, {d: d, drag: drag, touch:touch});

	if ( o.usePlaceholder !== false ) {
		if ( o.usePlaceholder === true && w._grabLabel() !== "" ) { 
			w.d.input.attr( "placeholder", w._grabLabel());
		}
		if ( typeof o.usePlaceholder === "string" ) {
			w.d.input.attr( "placeholder", o.usePlaceholder );
		}
	}

	o.theme = thisTheme;

	w.cancelClose = false;
	w.calBackDate = false;
	w.calDateVisible = true;
	w.disabled = false;
	w.runButton = false;
	w._date = window.Date;
	w._enhanceDate();
	w.baseID = w.d.input.attr( "id" );

	w.initDate = new w._date();
	w.initDate.setMilliseconds(0);
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

	w.d.wrap = w.d.input.wrap("<div class='datebox-input'>").parent();
	
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
		$( "<div class='datebox-input-icon'>" +
				"<span class='" + o.icnCls + o.buttonIcon + "'></span>" + 
				"</div>" )
			.attr( "title", w.__( "tooltip" ) )
			.on(o.clickEvent, function( e ) {
				e.preventDefault();
				if ( o.useFocus ) {
					w.d.input.focus();
				} else {
					if ( !w.disabled ) { w._t( { method: "open" } ); }
				}
			})
			.appendTo(w.d.wrap);
	} else {
		w.d.wrap.css( "width", "100%" );
	}

	if ( o.hideInput ) { w.d.wrap.hide(); }
	if ( o.hideContainer ) { w.d.wrap.parent().hide(); }

	w.d.input
		.on( "focus.datebox", function(){
			w.d.input.addClass( "ui-focus" );
			if ( w.disabled === false && o.useFocus ) {
				w._t( { method: "open" } );
			}
		})
		.on( "blur.datebox", function() { 
			w.d.input.removeClass( "ui-focus" ); 
		})
		.on( "change.datebox", function() {
			/* 
			o.runOnBlur === function ( {oldDate, newDate, wasGoodDate} ) { return {didSomething(bool), newDate}; }
			*/
			if ( typeof o.runOnBlurCallback === "function" ) {
				runTmp = w._makeDate( w.d.input.val(), true );
				ranTmp = o.runOnBlurCallback.apply( w, [{
					oldDate: w.theDate,
					newDate: runTmp[0],
					wasGoodDate: !runTmp[1],
					wasBadDate: runTmp[1]
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

	w.applyMinMax(false, false);

	w.d.input.on( "datebox", function(e,p) {
		var w = $( this ).data( "jtsage-datebox" ),
			o = $( this ).data( "jtsage-datebox" ).options;

		if ( p.method === "postrefresh" && o.useSelectMenu ) {
			w.d.intHTML.find( "select" ).each( function () {
				$(this).selectmenu();
			});
		}
	});

	if ( o.useInline || o.useInlineBlind ) {
		w.open();
	}


	//Throw dateboxinit event
	$( document ).trigger( "dateboxaftercreate" );
};

JTSageDateBox.open = function () {
	// PUBLIC function to open the control
	var w = this,
		o = this.options,
		basepop = {};

	if ( o.useFocus && w.fastReopen === true ) { 
		w.d.input.blur();
		return false;
	}


	w.theDate = w._makeDate( w.d.input.val() );
	w.calBackDate = false;
	if ( w.d.input.val() === "" ) { w._startOffset( w.theDate ); }
	w.d.input.blur();

	if ( typeof w._build[ o.mode ] === "undefined" ) {
		w._build[ "default" ].apply( w, [] );
	} else {
		w._build[ o.mode ].apply( w, [] );
	}
	if ( typeof w._drag[ o.mode ] !== "undefined" ) {
		w._drag[ o.mode ].apply( w, [] );
	}

	w._t( { method: "refresh" } );

	if ( w.__( "useArabicIndic" ) === true ) { w._doIndic(); }

	if ( ( o.useInline ) && w.initDone === false ) {
		w.d.mainWrap.append( w.d.intHTML );
		
		if ( o.hideContainer ) {
			if ( o.useHeader ) {
				w.d.mainWrap.prepend( $(w._spf(
					"<div class='{c1}'><h4 class='{c2}'>{text}</h4></div>",
				{
					c1: "ui-datebox-header",
					c2: "ui-datebox-header-title",
					text: w.d.headerText,
				})));
			}
			w.d.wrap.parent().after( w.d.mainWrap );
		} else {
			w.d.wrap.parent().append( w.d.mainWrap );
		}

		switch ( o.useInlineAlign ) {
			case "right":
				w.d.mainWrap.css({marginRight: 0, marginLeft: "auto"});
				break;
			case "left":
				w.d.mainWrap.css({marginLeft: 0, marginRight: "auto"});
				break;
			case "center":
			case "middle":
				w.d.mainWrap.css({marginLeft: "auto", marginRight: "auto"});
				break;
		}

		w.d.mainWrap.removeClass( "ui-datebox-hidden ui-overlay-shadow" );
		w.d.mainWrap.addClass( "ui-corner-all ui-widget ui-widget-content" );
		if ( o.useInline ) {
			w.d.mainWrap
				.addClass( "ui-datebox-inline" )
				.css( "zIndex", "auto" );

			if ( !o.hideInput && !o.hideContainer ) {
				w.d.mainWrap.addClass("ui-datebox-inline-has-input");
			} 
			// This is really hacky.  I hate it, but I don't have a 
			// better idea right now.  Cleans up position on flip variants.
			setTimeout( (function(w) { 
				return function() {
					w._t( { method: "postrefresh" } );
				};
			}(w)), 100);
			return true;
		} else {
			w.d.mainWrap
				.addClass( "ui-datebox-inline ui-datebox-inline-has-input" )
				.css( "zIndex", "auto" );
			w.d.mainWrap.hide();
		}
		w.initDone = false;
		w._t( { method: "postrefresh" } );
	}

	if ( o.useInlineBlind ) {
		if ( w.initDone ) { 
			w.refresh();
			w.d.mainWrap.slideDown();
			w._t( { method: "postrefresh" } );
		} else { 
			w.initDone = true; 
		}
		return true;
	}

	// Ignore if already open
	if ( w.d.intHTML.is( ":visible" ) ) { return false; }

	w.d.mainWrap.empty();

	// if ( o.useHeader ) {

	// 	w.d.mainWrap.append( $(w._spf(
	// 			"<div class='{c1}'><h4 class='{c2}'>" +
	// 			"<span class='{c3}'></span>{text}</h4></div>",
	// 		{
	// 			c1: "modal-header",
	// 			c2: "modal-title text-center",
	// 			c3: "closer" + o.icnCls + "remove pull-" + o.popupButtonPosition,
	// 			text: w.d.headerText,
	// 		}))
	// 	).find( ".closer" ).on( o.clickEventAlt, function( e ) {
	// 		e.preventDefault();
	// 		w._t( { method: "close", closeCancel: true } );
	// 	} );
	// }
	
	w.d.mainWrap.addClass( "ui-corner-all ui-widget ui-widget-content" );
	
	w.d.mainWrap.append( w.d.intHTML ).css({
		"zIndex": o.zindex,
		"position": "absolute",
		"top": w.d.input.offset().top + w.d.input.height,
		"left": w.d.input.offset().left,
	});

	w._t( { method: "postrefresh" } );


	// Perpare open callback, if provided. Additionally, if this
	// returns false then the open/update will stop.
	if ( o.openCallback !== false ) {
		if ( ! $.isFunction( o.openCallback ) ) {
			if ( typeof window[ o.openCallback ] === "function" ) {
				o.openCallback = window[ o.openCallback ];
			}
		}
		basepop.afteropen = function() {
			w._t( { method: "postrefresh" } );
			if ( o.openCallback.apply( w, $.merge([{
						custom: w.customCurrent,
						initDate: w.initDate,
						date: w.theDate,
						duration: w.lastDuration
					}], o.openCallbackArgs ) ) === false ) {

				w._t( {method: "close"} );
			}
		};
	} else {
		basepop.afteropen = function() {
			w._t( { method: "postrefresh" } );
		};
	}

	// Perpare BEFORE open callback, if provided. Additionally, if this
	// returns false then the open/update will stop.
	if ( o.beforeOpenCallback !== false ) {
		if ( ! $.isFunction( o.beforeOpenCallback ) ) {
			if ( typeof window[ o.beforeOpenCallback ] === "function" ) {
				o.beforeOpenCallback = window[ o.beforeOpenCallback ];
			}
		}
		if ( o.beforeOpenCallback.apply( w, $.merge([{
				custom: w.customCurrent,
				initDate: w.initDate,
				date: w.theDate,
				duration: w.lastDuration
			}], o.beforeOpenCallbackArgs ) ) === false ) {
				return false;
		}
	}

	w.d.mainWrap
		.css("display", "none")
		.appendTo(w.d.wrap);

	w.d.backdrop = $("<div></div>")
		.css({ position: "fixed", left: 0, top: 0, bottom: 0, right: 0 })
		.addClass( "ui-widget-overlay" )
		.appendTo( "body" )
		.on( o.clickEvent, function (e) {
			e.preventDefault();
			w._t( { method: "close", closeCancel: true } );
		});

	window.setTimeout(function () {
		w.d.mainWrap.slideDown((o.useAnimation === true ) ? o.useAnimationTime : 0, function() {
			basepop.afteropen.call();
		});
	}, 0);
	
};

JTSageDateBox.close = function() {
	// Provide a PUBLIC function to close the element.
	var w = this,
		o = this.options,
		basepop = {};

	w.calBackDate = false;
	
	if ( o.useInline || w.d.intHTML === false ) { 
		// Do nothing for useInline or empty.
		return true;
	}

	// Trigger the popup to close
	// // Prepare close callback.
	if ( o.closeCallback !== false ) {
		if ( ! $.isFunction( o.closeCallback ) ) {
			if ( typeof window[ o.closeCallback ] === "function" ) {
				o.closeCallback = window[ o.closeCallback ];
			}
		}
		basepop.afterclose = function() {
			o.closeCallback.apply( w, $.merge([{
				custom: w.customCurrent,
				initDate: w.initDate,
				date: w.theDate,
				duration: w.lastDuration,
				cancelClose: w.cancelClose
			}], o.closeCallbackArgs ) );
		};
	} else {
		basepop.afterclose = function() {
			return true;
		};
	}

	w.d.backdrop.remove();
	w.d.mainWrap.slideUp((o.useAnimation === true ) ? o.useAnimationTime : 0, function() {
		basepop.afterclose.call();
	});

	// Unbind all drag handlers.
	$( document )
		.off( w.drag.eMove )
		.off( w.drag.eEnd )
		.off( w.drag.eEndA );

	if ( o.useFocus ) {
		w.fastReopen = true;
		setTimeout( (function( t ) { 
			return function () { 
				t.fastReopen = false; 
			};
		}( w )), 300 );
	}
};

JTSageDateBox.disable = function() {
	var w = this;
	// Provide a PUBLIC function to Disable the element
	w.d.input.attr( "disabled", true );
	w.disabled = true;
	w._t( { method: "disable"});
};

JTSageDateBox.enable = function() {
	var w = this;
	// Provide a PUBLIC function to Enable the element
	w.d.input.attr( "disabled", false );
	w.disabled = false;
	w._t( { method: "enable" });
};

JTSageDateBox._controlGroup = function(element) {
	var o = this.options;

	if ( o.useCollapsedBut ) {
		element.find( ".ui-button" )
			.css({ marginRight: "0px" })
			.removeClass( "ui-corner-all" )
			.first().addClass( "ui-corner-left" )
			.end().last().addClass( "ui-corner-right" );
	} else {
		element.find( ".ui-button" ).css({ width: "90% "})
			.removeClass( "ui-corner-all" )
			.first().addClass( "ui-corner-top" )
			.end().last().addClass( "ui-corner-bottom" );
	}
	return element;
};

