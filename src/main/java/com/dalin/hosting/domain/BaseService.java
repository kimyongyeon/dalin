package com.dalin.hosting.domain;

import com.dalin.hosting.domain.code.QCommonCode;
import com.dalin.hosting.domain.file.QCommonFile;
import com.dalin.hosting.domain.program.QProgram;
import com.dalin.hosting.domain.program.menu.QMenu;
import com.dalin.hosting.domain.user.QUser;
import com.dalin.hosting.domain.user.auth.QUserAuth;
import com.dalin.hosting.domain.user.auth.menu.QAuthGroupMenu;
import com.dalin.hosting.domain.user.role.QUserRole;
import com.chequer.axboot.core.domain.base.AXBootBaseService;
import com.chequer.axboot.core.domain.base.AXBootJPAQueryDSLRepository;

import java.io.Serializable;


public class BaseService<T, ID extends Serializable> extends AXBootBaseService<T, ID> {

    protected QUserRole qUserRole = QUserRole.userRole;
    protected QAuthGroupMenu qAuthGroupMenu = QAuthGroupMenu.authGroupMenu;
    protected QCommonCode qCommonCode = QCommonCode.commonCode;
    protected QUser qUser = QUser.user;
    protected QProgram qProgram = QProgram.program;
    protected QUserAuth qUserAuth = QUserAuth.userAuth;
    protected QMenu qMenu = QMenu.menu;
    protected QCommonFile qCommonFile = QCommonFile.commonFile;

    protected AXBootJPAQueryDSLRepository<T, ID> repository;

    public BaseService() {
        super();
    }

    public BaseService(AXBootJPAQueryDSLRepository<T, ID> repository) {
        super(repository);
        this.repository = repository;
    }
}
