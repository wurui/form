<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:oxm="https://www.openxsl.com">

    <xsl:template match="/root" name="wurui.form">
        <xsl:param name="forward_url"/>
        <!-- className 'J_OXMod' required  -->
        <xsl:variable name="form" select="data/form"/>

        <div class="J_OXMod oxmod-form" ox-mod="form" data-forwardurl="{$forward_url}">
            <form method="{normalize-space($form/method)}" action="{normalize-space($form/action)}">
                <xsl:if test="boolean($form/ajax)">
                    <xsl:attribute name="data-ajax">true</xsl:attribute>
                </xsl:if>
                <xsl:if test="q/_id">
                    <input type="hidden" name="_id" value="{q/_id}"/>
                </xsl:if>
                <ul>
                    <xsl:for-each select="$form/fields/i">
                        <li class="type-{type}">
                            <xsl:choose>
                                <xsl:when test="type = 'select'">
                                    <select name="{name}">
                                        <xsl:if test="required"><xsl:attribute name="required">required</xsl:attribute></xsl:if>
                                        <option value="">选择<xsl:value-of select="label"/>...
                                        </option>
                                        <xsl:for-each select="options/i">
                                            <option>
                                                <xsl:value-of select="."/>
                                            </option>
                                        </xsl:for-each>
                                    </select>
                                </xsl:when>
                                <xsl:when test="type = 'file'">
                                    <div class="imgupload-combo" data-name="{name}">
                                        <label class="input-file-trigger" for="{generate-id(.)}">
                                            <xsl:value-of select="label"/>
                                        </label>
                                        <input id="{generate-id(.)}" style="position:fixed;left:-9999px;top:-9999px;"
                                               placeholder="{label}" data-name="{name}" type="{type}"/>
                                        <input type="hidden" name="{name}" />
                                    </div>
                                </xsl:when>
                                <xsl:otherwise>
                                    <input placeholder="{label}" name="{name}" type="{type}"><xsl:if test="required"><xsl:attribute name="required">required</xsl:attribute></xsl:if></input>
                                </xsl:otherwise>
                            </xsl:choose>
                        </li>
                    </xsl:for-each>

                    <li class="bottom">
                        <button class="J_submit">提交</button>
                    </li>
                </ul>
            </form>
        </div>
    </xsl:template>

</xsl:stylesheet>
