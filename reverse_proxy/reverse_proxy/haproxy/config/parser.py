import pyparsing as pp


def strip(tokens):
    tokens[0] = tokens[0].strip()


hash_ = pp.Literal("#")

comment = hash_ + pp.Optional(pp.restOfLine)

global_directive = pp.Literal('global')
global_ = global_directive + pp.lineEnd().suppress()

defaults_directive = pp.Literal('defaults')
defaults = defaults_directive + pp.lineEnd().suppress()

backend_directive = pp.Literal('backend')
backend_name = pp.Word(pp.printables).setResultsName('name')
backend = backend_directive + pp.White().suppress() + backend_name + pp.lineEnd().suppress()

frontend_directive = pp.Literal('frontend')
frontend_name = pp.Word(pp.printables).setResultsName('name')
frontend = frontend_directive + pp.White().suppress() + frontend_name + pp.lineEnd().suppress()

use_backend_directive = pp.Literal('use_backend').suppress()

option_name = pp.Word(pp.printables).setResultsName('name')
option_value = pp.restOfLine.setResultsName('value')
option_value.setParseAction(strip)
option = ~pp.LineStart() + pp.White().suppress() + ~use_backend_directive + option_name + pp.White().suppress() + option_value


use_backend_name = pp.Word(pp.printables).setResultsName('backend')
use_backend_option = ~pp.LineStart() + pp.White().suppress() + \
                     use_backend_directive + pp.White().suppress() + \
                     use_backend_name + pp.White().suppress() + option_value

global__ = (
        global_.suppress() +
        pp.ZeroOrMore(
            pp.Group(option)
        )
).setResultsName('global')

defaults_ = (
        defaults.suppress() +
        pp.ZeroOrMore(
            pp.Group(option)
        )
).setResultsName('defaults')

backends = pp.Group(
    pp.ZeroOrMore(
        pp.Group(
            backend + pp.Group(
                pp.ZeroOrMore(
                    pp.Group(option)
                )
            ).setResultsName('options')
        )
    )
).setResultsName('backends')

frontends = pp.Group(
    pp.ZeroOrMore(
        pp.Group(
            frontend + pp.Group(
                pp.ZeroOrMore(
                    pp.Group(option)
                )
            ).setResultsName('options') +
            pp.Group(
                pp.ZeroOrMore(
                    pp.Group(use_backend_option)
                )
            ).setResultsName('use_backend')
        )
    )
).setResultsName('frontends')

empty_line = pp.LineStart() + pp.LineEnd()

_parser_ = global__ + defaults_ + frontends + backends

_parser_.ignore(comment)
_parser_.ignore(empty_line)


def parse(data):
    return _parser_.parseString(data)
